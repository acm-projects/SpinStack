// app/(tabs)/create.tsx - Fixed to use real data
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Image, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMomentStore } from "../stores/useMomentStore";
import { supabase } from "@/constants/supabase";

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

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

interface TopHitTrack extends SpotifyTrack {
  momentCount: number;
}

export default function SearchPage() {
  const setSelectedMoment = useMomentStore((s) => s.setSelectedMoment);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
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
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [search]);

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

      setResults(data.tracks?.items || []);
    } catch (err) {
      console.error("Search error:", err);
      Alert.alert("Error", "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const showTopHits = !search.trim() && topHits.length > 0;
  const showSearchResults = search.trim() && results.length > 0;

  const renderTrack = ({ item, index }: { item: SpotifyTrack | TopHitTrack; index: number }) => (
    <Pressable
      onPress={() => {
        // Convert Spotify track to moment format
        const moment = {
          id: item.id,
          title: item.name,
          artist: item.artists.map((a) => a.name).join(", "),
          length: Math.floor(item.duration_ms / 1000),
          start: 0.5,
          end: 0.6,
          album: { uri: item.album.images[0]?.url },
          waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
        };
        setSelectedMoment(moment);
        router.push({ pathname: "/createProcess/momentProcess" });
      }}
    >
      <View style={styles.songRow}>
        <Text style={styles.rank}>{index + 1}</Text>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.songArtist}>
            {item.artists.map((a) => a.name).join(", ")}
          </Text>
          {'momentCount' in item && (
            <Text style={styles.momentCount}>
              {item.momentCount} moment{item.momentCount !== 1 ? 's' : ''} created
            </Text>
          )}
        </View>
        {item.album.images[0]?.url && (
          <Image source={{ uri: item.album.images[0].url }} style={styles.albumArt} />
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for songs..."
          placeholderTextColor="#333C42"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Section Title */}
      {showTopHits && <Text style={styles.sectionTitle}>Top Hits This Week</Text>}

      {/* Loading State */}
      {loading || (loadingTopHits && !search.trim()) ? (
        <ActivityIndicator size="large" color="#39868F" style={styles.loader} />
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
          data={results}
          contentContainerStyle={styles.listContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderTrack({ item, index })}
          style={styles.list}
        />
      ) : (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {search.trim() ? "No results found" : "Top hits will appear here"}
          </Text>
        </View>
      )}
    </SafeAreaView>
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
    fontFamily: "Lato",
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
    fontFamily: "Lato",
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: "#333C42",
    fontSize: 18,
    fontFamily: "Lato",
  },
  songArtist: {
    color: "#39868F",
    fontSize: 13,
    fontFamily: "Lato",
  },
  momentCount: {
    color: "#5cd6ffff",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
    fontFamily: "Lato",
  },
  albumArt: {
    width: 45,
    height: 45,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#333C42",
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
    fontFamily: "Lato",
    textAlign: "center",
  },
});