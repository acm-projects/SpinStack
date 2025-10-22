import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Font from "expo-font";
import { supabase } from "@/constants/supabase";
import { RelativePathString, useRouter } from "expo-router";

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

type SearchType = "Songs" | "Stacks" | "Users";

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

export default function SearchPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<SearchType>("Songs");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{
    tracks?: SpotifyTrack[];
    stacks?: Stack[];
    users?: User[];
  }>({});
  const [topHits, setTopHits] = useState<TopHitTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopHits, setLoadingTopHits] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Helper function to extract Spotify track ID
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

  // Auto-search when user types
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search is empty, clear results and show top hits
    if (!search.trim()) {
      setResults({});
      return;
    }

    // Set a new timeout to search after 500ms of no typing
    const timeout = setTimeout(() => {
      handleSearch();
    }, 100);

    setSearchTimeout(timeout);

    // Cleanup function
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [search, activeFilter]);

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
              Authorization: `Bearer ${token}`,
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
    if (!search.trim()) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        Alert.alert("Error", "You are not signed in");
        return;
      }

      setLoading(true);

      if (activeFilter === "Songs") {
        const url = `${nUrl}/api/spotify/search?q=${encodeURIComponent(
          search
        )}&type=track&limit=20`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          Alert.alert("Connection Error", "Cannot reach backend server");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          Alert.alert("Error", data.error || "Failed to search");
          setLoading(false);
          return;
        }

        setResults({
          tracks: data.tracks?.items || [],
        });
      } else if (activeFilter === "Stacks") {
        const { data: stacks, error } = await supabase
          .from("stacks")
          .select(
            `
            *,
            users (
              username,
              pfp_url
            )
          `
          )
          .eq("visibility", true)
          .ilike("title", `%${search}%`)
          .limit(20);

        if (error) {
          Alert.alert("Error", "Failed to search stacks");
          console.error(error);
          setLoading(false);
          return;
        }

        setResults({
          stacks: stacks || [],
        });
      } else if (activeFilter === "Users") {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .or(
            `username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
          )
          .limit(20);

        if (error) {
          Alert.alert("Error", "Failed to search users");
          console.error(error);
          setLoading(false);
          return;
        }

        // Fetch download URLs for profile pictures
        const usersWithPfp = await Promise.all(
          (users || []).map(async (user) => {
            let pfp = null;
            if (user.pfp_url) {
              try {
                const res = await fetch(
                  `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${user.pfp_url}`
                );
                if (res.ok) {
                  const { downloadURL } = await res.json();
                  pfp = downloadURL;
                }
              } catch (err) {
                console.error("Failed to fetch pfp for user:", user.id, err);
              }
            }
            return { ...user, pfp_url: pfp };
          })
        );

        setResults({
          users: usersWithPfp,
        });
      }
    } catch (err) {
      console.error("Search error:", err);
      Alert.alert("Error", "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentResults = () => {
    if (activeFilter === "Songs") {
      return results.tracks || [];
    } else if (activeFilter === "Stacks") {
      return results.stacks || [];
    } else {
      return results.users || [];
    }
  };

  const showTopHits =
    !search.trim() && topHits.length > 0 && activeFilter === "Songs";
  const showSearchResults = search.trim() && getCurrentResults().length > 0;

  const renderTrack = ({
    item,
    index,
  }: {
    item: SpotifyTrack | TopHitTrack;
    index: number;
  }) => (
    <View style={styles.songRow}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.songArtist}>
          {item.artists.map((a) => a.name).join(", ")}
        </Text>
      </View>
      {item.album.images[0]?.url && (
        <Image source={{ uri: item.album.images[0].url }} style={styles.albumArt} />
      )}
    </View>
  );

  const renderStack = ({ item, index }: { item: Stack; index: number }) => (
    <View style={styles.songRow}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.songArtist}>
          By {item.users?.username || "Unknown"}
        </Text>
        {item.description && (
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.stackDesc}>
            {item.description}
          </Text>
        )}
      </View>
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.albumArt} />
      ) : (
        <View style={[styles.albumArt, styles.placeholderArt]}>
          <Text style={styles.placeholderText}>🎵</Text>
        </View>
      )}
    </View>
  );

  const renderUser = ({ item, index }: { item: User; index: number }) => {
    const displayName =
      item.first_name && item.last_name
        ? `${item.first_name} ${item.last_name}`
        : item.username;

    return (
      <Pressable
        style={styles.songRow}
        onPress={() => {
          router.push(`/profile/${item.id}` as RelativePathString);
        }}
      >
        <Text style={styles.rank}>{index + 1}</Text>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {displayName}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.songArtist}>
            @{item.username}
          </Text>
          {item.bio && (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.stackDesc}>
              {item.bio}
            </Text>
          )}
        </View>
        {item.pfp_url ? (
          <Image source={{ uri: item.pfp_url }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic, styles.placeholderArt]}>
            <Text style={styles.placeholderText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#333C42"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
            }}
            returnKeyType="search"
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {(["Songs", "Stacks", "Users"] as SearchType[]).map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => {
                setActiveFilter(filter);
                setResults({});
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Section Title */}
        {showTopHits && (
          <Text style={styles.sectionTitle}>Top Hits This Week</Text>
        )}

        {/* Loading State */}
        {loading || (loadingTopHits && !search.trim() && activeFilter === "Songs") ? (
          <ActivityIndicator
            size="large"
            color="#39868F"
            style={styles.loader}
          />
        ) : showTopHits ? (
          /* Top Hits List */
          <FlatList
            data={topHits}
            contentContainerStyle={styles.listContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderTrack({ item, index })}
            style={styles.list}
          />
        ) : showSearchResults ? (
          /* Search Results List */
          <FlatList
            data={getCurrentResults()}
            contentContainerStyle={styles.listContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              if (activeFilter === "Songs") {
                return renderTrack({ item: item as SpotifyTrack, index });
              } else if (activeFilter === "Stacks") {
                return renderStack({ item: item as Stack, index });
              } else {
                return renderUser({ item: item as User, index });
              }
            }}
            style={styles.list}
          />
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search.trim()
                ? "No results found"
                : activeFilter === "Songs"
                  ? "Top hits will appear here"
                  : `Search for ${activeFilter.toLowerCase()} to get started`}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0E2",
    paddingHorizontal: 18,
    paddingTop: 70,
  },
  searchContainer: {
    backgroundColor: "#8DD2CA",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333C42",
  },
  searchInput: {
    color: "#333C42",
    fontSize: 16,
    fontFamily: "Jacques Francois",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#8DD2CA",
    borderWidth: 1.5,
    borderColor: "#333C42",
  },
  filterButtonActive: {
    backgroundColor: "#333C42",
    borderColor: "#333C42",
  },
  filterText: {
    color: "#333C42",
    fontSize: 14,
    fontFamily: "Jacques Francois",
  },
  filterTextActive: {
    color: "#FFF0E2",
  },
  sectionTitle: {
    fontSize: 25,
    fontFamily: "Luxurious Roman",
    color: "#333C42",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  listContainer: {
    backgroundColor: "#8DD2CA",
    borderRadius: 15,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#333C42",
  },
  list: {
    marginBottom: 92,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  rank: {
    color: "#333C42",
    fontSize: 20,
    width: 25,
    textAlign: "center",
    fontFamily: "Jacques Francois",
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: "#333C42",
    fontSize: 18,
    fontFamily: "Jacques Francois",
  },
  songArtist: {
    color: "#39868F",
    fontSize: 13,
    fontFamily: "Jacques Francois",
  },
  stackDesc: {
    color: "#39868F",
    fontSize: 11,
    fontFamily: "Jacques Francois",
    marginTop: 2,
  },
  albumArt: {
    width: 45,
    height: 45,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#333C42",
  },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: "#333C42",
  },
  placeholderArt: {
    backgroundColor: "#39868F",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#FFF0E2",
    fontSize: 18,
    fontWeight: "600",
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#39868F",
    fontSize: 16,
    fontFamily: "Jacques Francois",
    textAlign: "center",
  },
});