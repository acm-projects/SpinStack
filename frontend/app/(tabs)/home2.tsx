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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import { supabase } from "@/constants/supabase";
import { useRouter, RelativePathString } from "expo-router";
import { useMomentInfoStore } from "../stores/useMomentInfoStore";
import { useTabBar } from './profile/tabBarContext';

const { width } = Dimensions.get("window");
const POLAROID_WIDTH = 150;
const POLAROID_HEIGHT = 200;
const POLAROID_URL = require("@/assets/images/polaroidFrame.webp");
const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;

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
  momentData?: {
    id: string;
    title: string;
    artist: string;
    songStart: number;
    songDuration: number;
    length: number;
    album: any;
    waveform: number[];
  };
  userData?: {
    name: string;
    profilePic: string | null;
  };
};

type MasonryProps = {
  data: MasonryItem[];
  spacing?: number;
  columns?: number;
  router: any;
  setSelectedMomentInfo: (momentInfo: any) => void;
};

function Masonry({ data, spacing = 8, columns = 2, router, setSelectedMomentInfo }: MasonryProps) {
  const [cols, setCols] = useState<MasonryItem[][]>([]);

  useEffect(() => {
    const withHeights = data.map((item) => ({
      ...item,
      height: Math.random() * 50 + 180,
    }));

    const nextCols: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const colHeights = new Array(columns).fill(0);

    for (const item of withHeights) {
      const minCol = colHeights.indexOf(Math.min(...colHeights));
      nextCols[minCol].push(item);
      colHeights[minCol] += item.height!;
    }

    setCols(nextCols);
  }, [data, columns]);

  const colWidth = (width - spacing * (columns + 1)) / columns;

  const handleMomentPress = (item: MasonryItem) => {
    if (item.type === 'moment' && item.momentData && item.userData) {
      setSelectedMomentInfo({
        moment: item.momentData,
        user: item.userData
      });
      
      router.push('/stack' as RelativePathString);
    }
  };

  const renderItem = (item: MasonryItem) => (
    <View
      key={item.id}
      style={{
        marginBottom: spacing,
        borderRadius: 16,
        backgroundColor: "#FFF0E2",
        overflow: "hidden",
      }}
    >
      <View style={styles.cardHeader}>
        <Pressable
          onPress={() => {
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
        <Feather name="more-horizontal" size={20} color="#555" />
      </View>

      <Pressable onPress={() => handleMomentPress(item)}>
        {item.type === 'stack' ? (
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
      </Pressable>

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
  const [albums, setAlbums] = useState<MasonryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const setSelectedMomentInfo = useMomentInfoStore((s) => s.setSelectedMomentInfo);
  const { tabHeight } = useTabBar();

  const loadFonts = async () => {
    await Font.loadAsync({
      "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
      "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

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

  const fetchCoverImageUrl = async (coverPath: string | null): Promise<string | null> => {
    if (!coverPath) return null;

    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      return coverPath;
    }

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

  const extractTrackId = (songUrl: string): string | null => {
    if (!songUrl) return null;
    const match = songUrl.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const fetchAllContent = async () => {
    try {
      setLoading(true);

      const { data: momentsData, error: momentsError } = await supabase
        .from("moments")
        .select(`
          id,
          cover_url,
          title,
          description,
          created_at,
          user_id,
          song_url,
          start_time,
          duration,
          users!inner(id, username, pfp_url)
        `)
        .order("created_at", { ascending: false });

      if (momentsError) throw momentsError;

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

      const allContent = [
        ...(momentsData || []).map(item => ({ ...item, type: 'moment' as const })),
        ...(stacksData || []).map(item => ({ ...item, type: 'stack' as const }))
      ];

      allContent.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const processedAlbums = await Promise.all(
        allContent.map(async (item) => {
          const userData = Array.isArray(item.users) ? item.users[0] : item.users;
          const pfpUrl = await fetchProfilePictureUrl(userData?.pfp_url);
          const coverUrl = await fetchCoverImageUrl(item.cover_url);

          const baseItem = {
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

          if (item.type === 'moment') {
            const trackId = extractTrackId(item.song_url);
            return {
              ...baseItem,
              momentData: {
                id: trackId || item.id,
                title: item.title,
                artist: item.description || "Unknown Artist",
                songStart: item.start_time || 0,
                songDuration: item.duration || 30,
                length: 180,
                album: coverUrl ? { uri: coverUrl } : require("@/assets/images/album1.jpeg"),
                waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
              },
              userData: {
                name: userData?.username || "Unknown User",
                profilePic: pfpUrl,
              }
            };
          }

          return baseItem;
        })
      );

      setAlbums(processedAlbums);
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      fetchAllContent();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF0E2", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#333C42" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF0E2", marginBottom: 0.747663551 * tabHeight }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SpinStack</Text>
        <Pressable style={styles.bellIcon}>
          <Feather name="bell" size={28} color="#333C42" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.profileScroll}
      >
        {profiles.map((p) => (
          <View key={p.id} style={styles.profileCircle} />
        ))}
      </ScrollView>

      <View style={styles.filterContainer}>
        {["Following", "For You"].map((filter) => (
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

      {albums.length > 0 ? (
        <Masonry 
          data={albums} 
          spacing={10} 
          columns={2} 
          router={router}
          setSelectedMomentInfo={setSelectedMomentInfo}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.username}>No content available</Text>
        </View>
      )}
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
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    paddingBottom: 60,
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
});