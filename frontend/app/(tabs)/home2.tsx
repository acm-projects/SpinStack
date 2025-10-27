import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import { supabase } from "@/constants/supabase";
import { useRouter, RelativePathString } from "expo-router";

const { width } = Dimensions.get("window");
const POLAROID_WIDTH = 150;
const POLAROID_HEIGHT = 200;
const POLAROID_URL = require("@/assets/images/polaroidFrame.webp");
const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL

const profiles = Array.from({ length: 10 }).map((_, i) => ({ id: i.toString() }));

type MasonryItem = {
  id: string;
  src: any;
  height?: number;
  user?: string;
  profilePic?: string | null;
  time?: string;
  caption?: string;
  cover_url?: string | null;
  type?: 'moment' | 'stack';
  userId?: string;
};

type MasonryProps = {
  data: MasonryItem[];
  spacing?: number;
  columns?: number;
  router: any;
  onPressMore?: (item: MasonryItem) => void;
};

// 🧱 Masonry Component
function Masonry({ data, spacing = 8, columns = 2, router, onPressMore }: MasonryProps) {
  const [cols, setCols] = useState<MasonryItem[][]>([]);

  useEffect(() => {
    const withHeights = data.map((item: any) => ({
      ...item,
      height: Math.random() * 50 + 180,
    }));

    const nextCols: any[][] = Array.from({ length: columns }, () => []);
    const colHeights = new Array(columns).fill(0);

    for (const item of withHeights) {
      const minCol = colHeights.indexOf(Math.min(...colHeights));
      nextCols[minCol].push(item);
      colHeights[minCol] += item.height!;
    }

    setCols(nextCols);
  }, [data, columns]);

  const colWidth = (width - spacing * (columns + 1)) / columns;

  const renderItem = (item: any) => (
    <View
      key={item.id}
      style={{
        marginBottom: spacing,
        borderRadius: 16,
        backgroundColor: "#FFF0E2",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <Pressable
          onPress={() => {
            console.log("Profile pressed, userId:", item.userId);
            if (item.userId) {
              router.push(`/profile/${item.userId}` as RelativePathString);
            }
          }}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        >
          <Image
            source={item.profilePic ? { uri: item.profilePic } : require("@/assets/images/profile.png")}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </Pressable>
        {item.type === "moment" && (
          <Pressable onPress={() => onPressMore?.(item)}>
            <Feather name="more-horizontal" size={20} color="#555" />
          </Pressable>
        )}
      </View>

      {/* Image - Different rendering for stacks vs moments */}
      {item.type === 'stack' ? (
        // Stack with polaroid frame
        <View style={{
          width: "100%",
          height: item.height,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}>
          <Image
            source={item.src}
            style={{
              width: POLAROID_WIDTH * 0.88,
              height: POLAROID_HEIGHT * 0.88,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
          <Image
            source={POLAROID_URL}
            style={{
              width: POLAROID_WIDTH,
              height: POLAROID_HEIGHT,
              position: "absolute",
              resizeMode: "contain",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -14 }, { translateY: -14 }],
            }}
          >
            <Feather name="play" size={28} color="white" />
          </View>
        </View>
      ) : (
        // Regular moment image
        <View>
          <Image
            source={item.src}
            style={{
              width: "100%",
              height: item.height,
              borderRadius: 16,
            }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              top: "47%",
              left: "49%",
              transform: [{ translateX: -10 }, { translateY: -10 }],
            }}
          >
            <Feather name="play" size={28} color="white" />
          </View>
        </View>
      )}

      {item.caption ? (
        <Text style={styles.caption}>{item.caption}</Text>
      ) : null}
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: spacing,
        backgroundColor: "#FFF0E2",
      }}
    >
      {cols.map((column, colIndex) => (
        <View key={colIndex} style={{ width: colWidth }}>
          {column.map(renderItem)}
        </View>
      ))}
    </ScrollView>
  );
}



export default function HomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("For You");
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [addToStackVisible, setAddToStackVisible] = useState(false);
  const [userStacks, setUserStacks] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [albums, setAlbums] = useState<MasonryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadFonts = async () => {
    await Font.loadAsync({
      "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
      "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  const fetchUserStacks = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const res = await fetch(`${NGROK_URL}/api/stacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const stacks = await res.json();
        setUserStacks(stacks);
      } else {
        console.error("Failed to fetch stacks:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching user stacks:", err);
    }
  };

  const addMomentToStack = async (stackId: string) => {
    if (!selectedItem) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const res = await fetch(`${NGROK_URL}/api/stacks/${stackId}/moments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ momentId: selectedItem.id }),
      });

      if (res.ok) {
        setAddToStackVisible(false);
        alert("Moment added to stack!");
      } else {
        const err = await res.json();
        console.error("Failed to add moment:", err);
        alert(err.error || "Failed to add moment");
      }
    } catch (err) {
      console.error(err);
    }
  };



  const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
    return user?.id || null;
  };

  const fetchFriends = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", userId);

      if (error) throw error;

      setFriends(data?.map((f: any) => f.friend_id) || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  // Helper function to fetch profile picture URL
  const fetchProfilePictureUrl = async (pfpPath: string | null): Promise<string | null> => {
    if (!pfpPath) return null;

    try {
      const res = await fetch(`${NGROK_URL}/api/upload/download-url/${pfpPath}`);
      if (res.ok) {
        const { downloadURL } = await res.json();
        return downloadURL;
      }
    } catch (err) {
      console.error("Failed to fetch profile picture URL:", err);
    }
    return null;
  };

  // Helper function to fetch cover image URL
  const fetchCoverImageUrl = async (coverPath: string | null): Promise<string | null> => {
    if (!coverPath) return null;

    // If it's already a full URL (http/https), return it directly
    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      return coverPath;
    }

    // Otherwise, fetch from API
    try {
      const res = await fetch(`${NGROK_URL}/api/upload/download-url/${coverPath}`);
      if (res.ok) {
        const { downloadURL } = await res.json();
        return downloadURL;
      }
    } catch (err) {
      console.error("Failed to fetch cover image URL:", err);
    }
    return null;
  };

  // Calculate time ago
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Fetch all moments and stacks with user data
  const fetchAllContent = async () => {
    try {
      setLoading(true);

      // Fetch moments with user info
      const { data: momentsData, error: momentsError } = await supabase
        .from("moments")
        .select(`
          id,
          cover_url,
          title,
          description,
          created_at,
          user_id,
          users!inner(id, username, pfp_url)
        `)
        .order("created_at", { ascending: false });

      if (momentsError) throw momentsError;

      // Fetch stacks with user info
      const { data: stacksData, error: stacksError } = await supabase
        .from("stacks")
        .select(`
          id,
          cover_url,
          title,
          description,
          created_at,
          user_id,
          users!inner(id, username, pfp_url)
        `)
        .order("created_at", { ascending: false });

      if (stacksError) throw stacksError;

      // Combine and format data
      const allContent = [
        ...(momentsData || []).map(item => ({ ...item, type: 'moment' as const })),
        ...(stacksData || []).map(item => ({ ...item, type: 'stack' as const }))
      ];

      // Apply friends filter
      const filteredContent = allContent.filter(item => {
        if (activeFilter === "Friends") {
          return friends.includes(item.user_id);
        }
        return true;
      });

      // Sort by created_at
      filteredContent.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Process each item to get URLs
      const processedAlbums = await Promise.all(
        filteredContent.map(async (item) => {
          const userData = Array.isArray(item.users) ? item.users[0] : item.users;
          const pfpUrl = await fetchProfilePictureUrl(userData?.pfp_url);
          const coverUrl = await fetchCoverImageUrl(item.cover_url);

          return {
            id: item.id,
            src: coverUrl ? { uri: coverUrl } : require("@/assets/images/album1.jpeg"),
            user: userData?.username || "Unknown User",
            profilePic: pfpUrl,
            time: getTimeAgo(item.created_at),
            caption: item.description || item.title || "",
            cover_url: coverUrl,
            type: item.type,
            userId: item.user_id,
          };
        })
      );

      setAlbums(processedAlbums);
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load fonts and fetch friends on mount
  useEffect(() => {
    loadFonts();
    fetchFriends();
  }, []);

  // Fetch content when fonts load, filter changes, or friends list changes
  useEffect(() => {
    if (fontsLoaded) {
      fetchAllContent();
    }
  }, [activeFilter, fontsLoaded, friends]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF0E2", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#333C42" />
      </View>
    );
  }

  const handleMorePress = (item: MasonryItem) => {
    setSelectedItem(item);
    fetchUserStacks(); // load latest stacks
    setAddToStackVisible(true);
  };



  return (
    <View style={{ flex: 1, backgroundColor: "#FFF0E2" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SpinStack</Text>
        <Pressable
          onPress={() => setNotificationsVisible(true)}
          style={styles.bellIcon}
        >
          <Feather name="bell" size={28} color="#333C42" />
        </Pressable>
      </View>

      {/* Profiles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.profileScroll}
      >
        {profiles.map((p) => (
          <View key={p.id} style={styles.profileCircle} />
        ))}
      </ScrollView>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {["Friends", "For You"].map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
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

      {/* Feed */}
      <View style={{ flex: 1 }}>
        <Masonry data={albums} spacing={10} columns={2} router={router} onPressMore={handleMorePress} />
      </View>
      {/* Notifications Popup */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsPopup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Notifications</Text>
              <Pressable onPress={() => setNotificationsVisible(false)}>
                <Feather name="x" size={26} color="#333C42" />
              </Pressable>
            </View>
            <View style={styles.popupContent}>
              <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>
                No notifications yet 📭
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ➕ Add to Stack Popup */}
      <Modal
        visible={addToStackVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddToStackVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsPopup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Add to Stack</Text>
              <Pressable onPress={() => setAddToStackVisible(false)}>
                <Feather name="x" size={26} color="#333C42" />
              </Pressable>
            </View>

            <View style={styles.popupContent}>

              <View style={{ flexDirection: "row", alignItems: "flex-start", }} >


                <ScrollView style={{ width: "100%" }}>
                  {userStacks.length === 0 ? (
                    <Text style={{ textAlign: "center", color: "#333C42", fontFamily: "Jacques Francois" }}>
                      No stacks yet
                    </Text>
                  ) : (
                    userStacks.map(stack => (
                      <TouchableOpacity
                        key={stack.id}
                        style={styles.stackOption}
                        onPress={() => addMomentToStack(stack.id)}
                      >
                        <Feather name="folder" size={20} color="#333C42" />
                        <Text style={styles.stackText}>{stack.title}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>

              </View>
              <TouchableOpacity style={styles.newStackButton}>
                <Feather name="plus" size={18} color="#333C42" />
                <Text style={styles.newStackText}>Create New Stack</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Luxurious Roman",
    fontSize: 34,
    paddingTop: 60,
    marginLeft: 97,
    alignSelf: "center",
    color: "#333C42",
  },
  bellIcon: {
    alignSelf: "center",
    paddingTop: 64,
    marginLeft: 78,
  },
  profileScroll: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    maxHeight: 80, // Add this to prevent it from expanding
    backgroundColor: "#FFF0E2",
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FFF0E2",
    marginBottom: 10,
    paddingTop: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterButtonActive: {},
  filterText: {
    color: "#afb2b3ff",
    fontSize: 18,
    fontFamily: "Jacques Francois",
  },
  filterTextActive: {
    color: "#333C42",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    paddingTop: -19,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 8,
  },
  username: {
    fontWeight: "800",
    color: "#333C42",
    fontSize: 14,
    fontFamily: "Jacques Francois",
  },
  time: {
    fontSize: 11,
    color: "#777",
    fontFamily: "Jacques Francois",
  },
  caption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#333C42",
    fontFamily: "Jacques Francois",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  friendsPopup: {
    width: "85%",
    backgroundColor: "#FFF0E2",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 200,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  popupTitle: {
    fontFamily: "Luxurious Roman",
    fontSize: 22,
    color: "#333C42",
  },
  popupContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  // ➕ Add-to-Stack styles
  stackOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    width: "200%",
  },
  stackText: {
    marginLeft: 10,
    fontFamily: "Jacques Francois",
    color: "#333C42",
    fontSize: 16,
  },
  newStackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  newStackText: {
    marginLeft: 6,
    color: "#333C42",
    fontFamily: "Jacques Francois",
    fontSize: 15,
  },
});