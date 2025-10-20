"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/constants/supabase";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

type SearchType = "song" | "stack" | "user";

interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string }[];
    };
    duration_ms: number;
    uri: string;
    preview_url?: string;
}

interface Stack {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    visibility: boolean;
    created_at: string;
    user_id: string;
    users?: {
        username: string;
        pfp_url: string;
    };
}

interface User {
    id: string;
    username: string;
    email: string;
    pfp_url: string;
    bio: string;
    first_name: string;
    last_name: string;
}

interface TopHitTrack extends SpotifyTrack {
    momentCount: number;
}

type SearchResult = SpotifyTrack | Stack | User;

export default function SearchScreen() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{
        tracks?: SpotifyTrack[];
        stacks?: Stack[];
        users?: User[];
    }>({});
    const [topHits, setTopHits] = useState<TopHitTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTopHits, setLoadingTopHits] = useState(true);
    const [selectedTab, setSelectedTab] = useState<SearchType>("song");

    // Helper function to extract Spotify track ID from various formats
    const extractTrackId = (songUrl: string): string | null => {
        if (!songUrl) return null;

        if (songUrl.includes("spotify:track:")) {
            return songUrl.split("spotify:track:")[1]?.split("?")[0] || null;
        }

        if (songUrl.includes("open.spotify.com/track/")) {
            const match = songUrl.match(/track\/([a-zA-Z0-9]+)/);
            return match ? match[1] : null;
        }

        if (/^[a-zA-Z0-9]+$/.test(songUrl)) {
            return songUrl;
        }

        return null;
    };

    useEffect(() => {
        fetchTopHits();
    }, []);

    const fetchTopHits = async () => {
        try {
            setLoadingTopHits(true);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: moments, error } = await supabase
                .from("moments")
                .select("song_url")
                .gte("created_at", sevenDaysAgo.toISOString());

            if (error) {
                console.error("Error fetching moments:", error);
                setLoadingTopHits(false);
                return;
            }

            if (!moments || moments.length === 0) {
                setTopHits([]);
                setLoadingTopHits(false);
                return;
            }

            const songCounts: { [key: string]: number } = {};
            moments?.forEach((moment) => {
                if (moment.song_url) {
                    const trackId = extractTrackId(moment.song_url);
                    if (trackId) {
                        songCounts[trackId] = (songCounts[trackId] || 0) + 1;
                    }
                }
            });

            const topTrackIds = Object.entries(songCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([id, count]) => ({ id, count }));

            if (topTrackIds.length === 0) {
                setTopHits([]);
                setLoadingTopHits(false);
                return;
            }

            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                setLoadingTopHits(false);
                return;
            }

            const trackPromises = topTrackIds.map(async ({ id, count }) => {
                try {
                    const response = await fetch(`${nUrl}/api/spotify/track/${id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (!response.ok) {
                        return null;
                    }

                    const trackData = await response.json();
                    return { ...trackData, momentCount: count } as TopHitTrack;
                } catch (err) {
                    return null;
                }
            });

            const tracks = (await Promise.all(trackPromises)).filter(
                (track): track is TopHitTrack => track !== null
            );

            setTopHits(tracks);
        } catch (err) {
            console.error("Error fetching top hits:", err);
        } finally {
            setLoadingTopHits(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) {
            Alert.alert("Error", "Please enter a search query");
            return;
        }

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                return Alert.alert("Error", "You are not signed in");
            }

            setLoading(true);

            if (selectedTab === "song") {
                // Search Spotify for songs
                const url = `${nUrl}/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=20`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    Alert.alert("Connection Error", "Cannot reach backend server");
                    return;
                }

                if (!response.ok) {
                    Alert.alert("Error", data.error || "Failed to search");
                    return;
                }

                setResults({
                    tracks: data.tracks?.items || [],
                });
            } else if (selectedTab === "stack") {
                // Search Supabase for stacks
                const { data: stacks, error } = await supabase
                    .from("stacks")
                    .select(`
                        *,
                        users (
                            username,
                            pfp_url
                        )
                    `)
                    .eq("visibility", true)
                    .ilike("title", `%${query}%`)
                    .limit(20);

                if (error) {
                    Alert.alert("Error", "Failed to search stacks");
                    console.error(error);
                    return;
                }

                setResults({
                    stacks: stacks || [],
                });
            } else if (selectedTab === "user") {
                // Search Supabase for users
                const { data: users, error } = await supabase
                    .from("users")
                    .select("*")
                    .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
                    .limit(20);

                if (error) {
                    Alert.alert("Error", "Failed to search users");
                    console.error(error);
                    return;
                }

                setResults({
                    users: users || [],
                });
            }
        } catch (err) {
            console.error("Search error:", err);
            Alert.alert("Error", "Failed to search");
        } finally {
            setLoading(false);
        }
    };

    const renderTrack = ({ item, index, isTopHit }: { item: SpotifyTrack | TopHitTrack; index: number; isTopHit?: boolean }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                Alert.alert(
                    "Track Selected",
                    `${item.name}\nby ${item.artists.map((a) => a.name).join(", ")}\n\nURI: ${item.uri}`
                );
            }}
        >
            <Text style={styles.rank}>{index + 1}</Text>
            {item.album.images[0]?.url && (
                <Image
                    source={{ uri: item.album.images[0].url }}
                    style={styles.thumbnail}
                />
            )}
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.artists.map((a) => a.name).join(", ")}
                </Text>
                {isTopHit && 'momentCount' in item && (
                    <Text style={styles.momentCount}>
                        {item.momentCount} moment{item.momentCount !== 1 ? 's' : ''} created
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderStack = ({ item }: { item: Stack }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                Alert.alert("Stack Selected", item.title);
            }}
        >
            {item.cover_url ? (
                <Image
                    source={{ uri: item.cover_url }}
                    style={styles.thumbnail}
                />
            ) : (
                <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                    <Text style={styles.placeholderText}>🎵</Text>
                </View>
            )}
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.resultSubtitle} numberOfLines={1}>
                    By {item.users?.username || 'Unknown'}
                </Text>
                {item.description && (
                    <Text style={styles.resultDetail} numberOfLines={1}>
                        {item.description}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderUser = ({ item }: { item: User }) => {
        const displayName = item.first_name && item.last_name 
            ? `${item.first_name} ${item.last_name}`
            : item.username;

        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                    Alert.alert("User Selected", displayName);
                }}
            >
                {item.pfp_url ? (
                    <Image
                        source={{ uri: item.pfp_url }}
                        style={[styles.thumbnail, styles.roundThumbnail]}
                    />
                ) : (
                    <View style={[styles.thumbnail, styles.roundThumbnail, styles.placeholderThumbnail]}>
                        <Text style={styles.placeholderText}>
                            {item.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <Text style={styles.resultSubtitle} numberOfLines={1}>
                        @{item.username}
                    </Text>
                    {item.bio && (
                        <Text style={styles.resultDetail} numberOfLines={1}>
                            {item.bio}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const getCurrentResults = () => {
        switch (selectedTab) {
            case "song":
                return results.tracks || [];
            case "stack":
                return results.stacks || [];
            case "user":
                return results.users || [];
            default:
                return [];
        }
    };

    const renderResult = ({ item, index }: { item: SearchResult; index: number }) => {
        switch (selectedTab) {
            case "song":
                return renderTrack({ item: item as SpotifyTrack, index, isTopHit: false });
            case "stack":
                return renderStack({ item: item as Stack });
            case "user":
                return renderUser({ item: item as User });
            default:
                return null;
        }
    };

    const showTopHits = !query.trim() && topHits.length > 0 && selectedTab === "song";
    const showSearchResults = query.trim() && getCurrentResults().length > 0;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Search</Text>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={
                            selectedTab === "song" 
                                ? "Search for songs..." 
                                : selectedTab === "stack"
                                ? "Search for stacks..."
                                : "Search for users..."
                        }
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        <Text style={styles.searchButtonText}>
                            {loading ? "..." : "Search"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    {(["song", "stack", "user"] as SearchType[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.tab, selectedTab === type && styles.activeTab]}
                            onPress={() => {
                                setSelectedTab(type);
                                setResults({});
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === type && styles.activeTabText,
                                ]}
                            >
                                {type === "song" ? "Songs" : type === "stack" ? "Stacks" : "Users"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loadingTopHits && !query.trim() && selectedTab === "song" ? (
                    <ActivityIndicator size="large" color="#0BFFE3" style={styles.loader} />
                ) : showTopHits ? (
                    <>
                        <Text style={styles.sectionTitle}>Top Hits This Week</Text>
                        <FlatList
                            data={topHits}
                            renderItem={({ item, index }) => renderTrack({ item, index, isTopHit: true })}
                            keyExtractor={(item) => item.id}
                            style={styles.resultsList}
                            contentContainerStyle={styles.resultsContent}
                            keyboardShouldPersistTaps="handled"
                        />
                    </>
                ) : loading ? (
                    <ActivityIndicator size="large" color="#0BFFE3" style={styles.loader} />
                ) : showSearchResults ? (
                    <FlatList
                        data={getCurrentResults()}
                        renderItem={renderResult}
                        keyExtractor={(item) => item.id}
                        style={styles.resultsList}
                        contentContainerStyle={styles.resultsContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No results found</Text>
                        }
                        keyboardShouldPersistTaps="handled"
                    />
                ) : (
                    <Text style={styles.emptyText}>
                        {query ? "No results found" : `Search for ${selectedTab}s to get started`}
                    </Text>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#121212",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#C0FDFB",
        marginBottom: 16,
        marginTop: 40,
    },
    searchContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#282828",
        borderRadius: 8,
        padding: 12,
        color: "white",
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: "#0BFFE3",
        borderRadius: 8,
        paddingHorizontal: 20,
        justifyContent: "center",
    },
    searchButtonText: {
        color: "#121212",
        fontWeight: "600",
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#282828",
    },
    activeTab: {
        backgroundColor: "#0BFFE3",
    },
    tabText: {
        color: "#999",
        fontSize: 14,
        fontWeight: "500",
    },
    activeTabText: {
        color: "#121212",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#C0FDFB",
        marginBottom: 12,
    },
    loader: {
        marginTop: 40,
    },
    resultsList: {
        flex: 1,
    },
    resultsContent: {
        paddingBottom: 20,
    },
    resultItem: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#282828",
        borderRadius: 8,
        marginBottom: 8,
        alignItems: "center",
    },
    rank: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        width: 30,
        textAlign: "center",
        marginRight: 8,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 4,
        backgroundColor: "#1a1a1a",
        marginRight: 12,
    },
    roundThumbnail: {
        borderRadius: 30,
    },
    placeholderThumbnail: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#333",
    },
    placeholderText: {
        fontSize: 24,
        color: "#666",
    },
    resultInfo: {
        flex: 1,
        justifyContent: "center",
    },
    resultTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    resultSubtitle: {
        color: "#b3b3b3",
        fontSize: 14,
        marginBottom: 2,
    },
    resultDetail: {
        color: "#666",
        fontSize: 12,
    },
    momentCount: {
        color: "#0BFFE3",
        fontSize: 12,
        marginTop: 2,
        fontWeight: "500",
    },
    emptyText: {
        color: "#666",
        fontSize: 16,
        textAlign: "center",
        marginTop: 40,
    },
});