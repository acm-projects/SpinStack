"use client";

import { useState } from "react";
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
import React from "react";

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

type SearchType = "track" | "album" | "artist" | "playlist";

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

interface SpotifyAlbum {
    id: string;
    name: string;
    artists: { name: string }[];
    images: { url: string }[];
    release_date: string;
    total_tracks: number;
    uri: string;
}

interface SpotifyArtist {
    id: string;
    name: string;
    images: { url: string }[];
    genres: string[];
    followers: { total: number };
    uri: string;
}

interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    images: { url: string }[];
    owner: { display_name: string };
    tracks: { total: number };
    uri: string;
}

type SearchResult = SpotifyTrack | SpotifyAlbum | SpotifyArtist | SpotifyPlaylist;

export default function SearchScreen() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{
        tracks?: SpotifyTrack[];
        albums?: SpotifyAlbum[];
        artists?: SpotifyArtist[];
        playlists?: SpotifyPlaylist[];
    }>({});
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState<SearchType>("track");

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

            const url = `${nUrl}/api/spotify/search?q=${encodeURIComponent(query)}&type=track,album,artist,playlist&limit=20`;
            console.log("Fetching:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Response status:", response.status);

            const text = await response.text();
            console.log("Response text (first 200 chars):", text.substring(0, 200));

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                console.error("Response was HTML/text, not JSON. This usually means:");
                console.error("1. Backend server is not running");
                console.error("2. ngrok tunnel is offline");
                console.error("3. Wrong URL in EXPO_PUBLIC_NGROK_URL");
                Alert.alert(
                    "Connection Error", 
                    "Cannot reach backend server. Make sure:\n\n1. Backend server is running (node server.js)\n2. ngrok is running (ngrok http 5000)\n3. EXPO_PUBLIC_NGROK_URL is updated"
                );
                return;
            }

            if (!response.ok) {
                Alert.alert("Error", data.error || "Failed to search");
                return;
            }

            setResults({
                tracks: data.tracks?.items || [],
                albums: data.albums?.items || [],
                artists: data.artists?.items || [],
                playlists: data.playlists?.items || [],
            });

            console.log("Search results:", {
                tracks: data.tracks?.items?.length || 0,
                albums: data.albums?.items?.length || 0,
                artists: data.artists?.items?.length || 0,
                playlists: data.playlists?.items?.length || 0,
            });

        } catch (err) {
            console.error("Search error:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to search";
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
    };

    const renderTrack = ({ item }: { item: SpotifyTrack }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                Alert.alert(
                    "Track Selected",
                    `${item.name}\nby ${item.artists.map((a) => a.name).join(", ")}\n\nURI: ${item.uri}`
                );
            }}
        >
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
                <Text style={styles.resultDetail}>
                    {item.album.name} • {formatDuration(item.duration_ms)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderAlbum = ({ item }: { item: SpotifyAlbum }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                Alert.alert("Album Selected", `${item.name}\nby ${item.artists.map((a) => a.name).join(", ")}`);
            }}
        >
            {item.images[0]?.url && (
                <Image
                    source={{ uri: item.images[0].url }}
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
                <Text style={styles.resultDetail}>
                    {item.release_date.split("-")[0]} • {item.total_tracks} tracks
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderArtist = ({ item }: { item: SpotifyArtist }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                Alert.alert("Artist Selected", item.name);
            }}
        >
            {item.images[0]?.url && (
                <Image
                    source={{ uri: item.images[0].url }}
                    style={[styles.thumbnail, styles.roundThumbnail]}
                />
            )}
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.genres.slice(0, 2).join(", ") || "Artist"}
                </Text>
                <Text style={styles.resultDetail}>
                    {item.followers.total.toLocaleString()} followers
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderPlaylist = ({ item }: { item: SpotifyPlaylist }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                Alert.alert("Playlist Selected", item.name);
            }}
        >
            {item.images[0]?.url && (
                <Image
                    source={{ uri: item.images[0].url }}
                    style={styles.thumbnail}
                />
            )}
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.resultSubtitle} numberOfLines={1}>
                    By {item.owner.display_name}
                </Text>
                <Text style={styles.resultDetail}>{item.tracks.total} tracks</Text>
            </View>
        </TouchableOpacity>
    );

    const getCurrentResults = () => {
        switch (selectedTab) {
            case "track":
                return results.tracks || [];
            case "album":
                return results.albums || [];
            case "artist":
                return results.artists || [];
            case "playlist":
                return results.playlists || [];
            default:
                return [];
        }
    };

    const renderResult = ({ item }: { item: SearchResult }) => {
        switch (selectedTab) {
            case "track":
                return renderTrack({ item: item as SpotifyTrack });
            case "album":
                return renderAlbum({ item: item as SpotifyAlbum });
            case "artist":
                return renderArtist({ item: item as SpotifyArtist });
            case "playlist":
                return renderPlaylist({ item: item as SpotifyPlaylist });
            default:
                return null;
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Search Spotify</Text>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for songs, albums, artists..."
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
                    {(["track", "album", "artist", "playlist"] as SearchType[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.tab, selectedTab === type && styles.activeTab]}
                            onPress={() => setSelectedTab(type)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === type && styles.activeTabText,
                                ]}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}s
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0BFFE3" style={styles.loader} />
                ) : (
                    <FlatList
                        data={getCurrentResults()}
                        renderItem={renderResult}
                        keyExtractor={(item) => item.id}
                        style={styles.resultsList}
                        contentContainerStyle={styles.resultsContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {query ? "No results found" : "Search for music to get started"}
                            </Text>
                        }
                        keyboardShouldPersistTaps="handled"
                    />
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
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 4,
        backgroundColor: "#1a1a1a",
    },
    roundThumbnail: {
        borderRadius: 30,
    },
    resultInfo: {
        flex: 1,
        marginLeft: 12,
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
    emptyText: {
        color: "#666",
        fontSize: 16,
        textAlign: "center",
        marginTop: 40,
    },
});