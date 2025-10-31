// app/(tabs)/create.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { moms } from '../../components/demoMoment'
import { useMomentStore } from "../stores/useMomentStore";
import { supabase } from "@/constants/supabase";
import { useLocalSearchParams } from "expo-router";


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


export default function TestSpotify() {

  return (
    <SafeAreaView
      style={{
        display: "flex",
        alignItems: "center",
        flex: 1,
        backgroundColor: '#FFF0E2',
      }}
    >
      <Text style={{ color: "black", fontSize: 30, fontWeight: "500", fontFamily: 'Luxurious Roman' }}>
        Create Your Moment
      </Text>

      <View style={{ width: '100%', flex: 1 }}>
        <SearchPage />
      </View>
    </SafeAreaView>
  );
}

function SearchPage() {
  const setSelectedMoment = useMomentStore((s) => s.setSelectedMoment);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [topHits, setTopHits] = useState<TopHitTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopHits, setLoadingTopHits] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { isStory } = useLocalSearchParams();
  const isStoryMode = isStory === "true";




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

  const filteredData = moms.filter(item => {
    if (!search.trim()) return true;//show all if empty
    const lowerQuery = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerQuery)
    );
  });

  const showTopHits = !search.trim();
  const showSearchResults = !!search.trim() && results.length > 0;

  const renderTrack = ({ item, index }: { item: SpotifyTrack | TopHitTrack; index: number }) => (
    <Pressable
      onPress={() => {
        // Convert Spotify track to moment format
        const moment = {
          id: item.id,
          title: item.name,
          artist: item.artists.map((a) => a.name).join(", "),
          length: Math.floor(item.duration_ms / 1000),
          songStart: 0,
          songDuration: 30,
          album: { uri: item.album.images[0]?.url },
          waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
        };
        setSelectedMoment(moment);
        router.push({
          pathname: "/createProcess/momentProcess",
          params: { isStory: isStoryMode ? "true" : "false" },
        });
      }}
    >
      <View style={styles2.songRow}>
        <Text style={styles2.rank}>{index + 1}</Text>
        <View style={styles2.songInfo}>
          <Text style={styles2.songTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles2.songArtist} numberOfLines={1} ellipsizeMode="tail">
            {item.artists.map((a) => a.name).join(", ")}
          </Text>
          {'momentCount' in item && (
            <Text style={styles2.momentCount}>
              {item.momentCount} moment{item.momentCount !== 1 ? 's' : ''} created
            </Text>
          )}
        </View>
        {item.album.images[0]?.url && (
          <Image source={{ uri: item.album.images[0].url }} style={styles2.albumArt} />
        )}
      </View>
    </Pressable>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles2.container]}>
        <View style={[styles2.searchContainer]}>
          <TextInput
            style={styles2.searchInput}
            placeholder="Search..."
            placeholderTextColor="#333c42"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {showTopHits ? (
          <Text style={styles2.sectionTitle}>Top Hits This Week</Text>
        ) : (
          <Text style={styles2.sectionTitle}>Select a Song</Text>
        )}

        {isStoryMode && (
          <Text style={{ color: "#39868F", fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            You are creating a story — it will disappear in 24 hours
          </Text>
        )}


        {loading || (loadingTopHits && !search.trim()) ? (
          <ActivityIndicator size="large" color="#39868F" style={styles2.loader} />
        ) : showTopHits ? (
          <FlatList
            data={topHits}
            contentContainerStyle={styles2.listContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderTrack({ item, index })}
            keyboardShouldPersistTaps="handled"
          />
        ) : showSearchResults ? (
          <FlatList
            data={results}
            contentContainerStyle={styles2.listContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderTrack({ item, index })}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles2.emptyContainer}>
            <Text style={styles2.emptyText}>
              {search.trim() ? "No results found" : "Top hits will appear here"}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0E2",
    paddingHorizontal: 16,
    marginBottom: '6%',
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
    fontFamily: 'Jacques Francois',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333c42",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
    fontFamily: 'Jacques Francois',
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
    width: '100%',
    borderRadius: 15
  },
  rank: {
    color: "#333c42",
    fontSize: 20,
    fontFamily: 'Jacques Francois',
    width: 25,
    textAlign: 'center'
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: "#333c42",
    fontFamily: 'Jacques Francois',
    fontSize: 16,
  },
  songArtist: {
    color: "#39868F",
    fontFamily: 'Jacques Francois',
    fontSize: 13,
  },
  momentCount: {
    color: "#1DB954",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
    fontFamily: "Jacques Francois",
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#333C42",
  },
  listContainer: {
    backgroundColor: '#8DD2CA',
    borderRadius: 15,
    paddingVertical: 5,
    borderWidth: 1.5,
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
    fontFamily: "Jacques Francois",
    textAlign: "center",
  },
});