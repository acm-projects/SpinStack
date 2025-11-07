import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import * as Font from "expo-font";
import { supabase } from "@/constants/supabase";
import { RelativePathString, useRouter } from "expo-router";

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;
const { width, height } = Dimensions.get("window");

type SearchType = "Stacks" | "Users";

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

export default function SearchPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<SearchType>("Stacks");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ stacks?: Stack[]; users?: User[] }>({});
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 🌬️ Rising bubbles animation setup
  const bubbleCount = 10;
  const bubbleAnims = useRef<Animated.Value[]>([]);
  const bubbles = useRef(
    Array.from({ length: bubbleCount }, () => ({
      left: Math.random() * width,
      size: 10 + Math.random() * 25,
      delay: Math.random() * 4000,
      speed: 7000 + Math.random() * 4000,
      opacity: 0.15 + Math.random() * 0.3,
    }))
  ).current;

  if (bubbleAnims.current.length === 0) {
    bubbles.forEach(() => bubbleAnims.current.push(new Animated.Value(0)));
  }

  useEffect(() => {
    bubbleAnims.current.forEach((anim, i) => {
      const animate = () => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: -height * 0.9,
          duration: bubbles[i].speed,
          delay: bubbles[i].delay,
          useNativeDriver: true,
        }).start(() => animate());
      };
      animate();
    });
  }, []);

  // 🔍 Auto-search when user types
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!search.trim()) {
      setResults({});
      return;
    }
    const timeout = setTimeout(() => handleSearch(), 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [search, activeFilter]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        Alert.alert("Error", "You are not signed in");
        return;
      }
      setLoading(true);
      if (activeFilter === "Stacks") {
        const { data: stacks, error } = await supabase
          .from("stacks")
          .select(`*, users ( username, pfp_url )`)
          .eq("visibility", true)
          .ilike("title", `%${search}%`)
          .limit(20);
        if (error) throw error;
        setResults({ stacks: stacks || [] });
      } else {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .or(
            `username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
          )
          .limit(20);
        if (error) throw error;
        const usersWithPfp = await Promise.all(
          (users || []).map(async (user) => {
            let pfp = null;
            if (user.pfp_url) {
              try {
                const res = await fetch(`${nUrl}/api/upload/download-url/${user.pfp_url}`);
                if (res.ok) {
                  const { downloadURL } = await res.json();
                  pfp = downloadURL;
                }
              } catch {}
            }
            return { ...user, pfp_url: pfp };
          })
        );
        setResults({ users: usersWithPfp });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentResults = () =>
    activeFilter === "Stacks" ? results.stacks || [] : results.users || [];

  const showSearchResults = search.trim() && getCurrentResults().length > 0;

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
        onPress={() => router.push(`/profile/${item.id}` as RelativePathString)}
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
        {bubbles.map((bubble, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              bottom: 50,
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              borderRadius: bubble.size / 2,
              backgroundColor: "#39868F",
              opacity: bubble.opacity,
              transform: [{ translateY: bubbleAnims.current[i] }],
              zIndex: 0,
            }}
          />
        ))}

        {/* Content */}
        <View style={{ flex: 1, zIndex: 2 }}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#333C42"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>

          <View style={styles.filterRow}>
            {(["Stacks", "Users"] as SearchType[]).map((filter) => (
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

          {loading ? (
            <ActivityIndicator size="large" color="#39868F" style={styles.loader} />
          ) : showSearchResults ? (
            <FlatList
              data={getCurrentResults()}
              contentContainerStyle={styles.listContainer}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) =>
                activeFilter === "Stacks"
                  ? renderStack({ item: item as Stack, index })
                  : renderUser({ item: item as User, index })
              }
              style={styles.list}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search.trim()
                  ? "No results found"
                  : `Search for ${activeFilter.toLowerCase()} to get started`}
              </Text>
            </View>
          )}
        </View>
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
    overflow: "hidden",
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
    fontFamily: "Lato",
  },
  filterTextActive: {
    color: "#FFF0E2",
  },
  listContainer: {
    backgroundColor: "#F9DDC3",
    borderRadius: 15,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#333C42",
    marginTop: 15,
  },
  list: {
    marginBottom: 92,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
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
    color: "#7f8081ff",
    fontSize: 13,
    fontFamily: "Lato",
  },
  stackDesc: {
    color: "#7f8081ff",
    fontSize: 11,
    fontFamily: "Lato",
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
    fontFamily: "Lato",
    textAlign: "center",
  },
});
