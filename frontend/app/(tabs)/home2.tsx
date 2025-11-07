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
  TextInput,
  Alert,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import { supabase } from "@/constants/supabase";
import { useRouter, RelativePathString } from "expo-router";
import { useMomentInfoStore } from "../stores/useMomentInfoStore";
import { useTabBar } from './profile/tabBarContext';
import MomentInfo, { Moment } from "@/components/momentInfo";
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


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
  onPressMore?: (item: MasonryItem) => void;
  setSelectedMomentInfo: (momentInfo: any) => void;
};

type StoryItem = {
  id: string;
  userId: string;
  username: string;
  profilePic: string | null;
  momentData: {
    id: string;
    cover_url?: string;
  };
  userData: {
    name?: string;
    profilePic?: string | null;
  };
};


function Masonry({ data, spacing = 8, columns = 2, router, onPressMore, setSelectedMomentInfo }: MasonryProps) {
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

  const handleMomentPress = (item: MasonryItem) => {


    if (item.type === "stack") {
      router.push(`/(tabs)/stackViewer?id=${item.id}` as RelativePathString);
    } else if (item.type === 'moment' && item.momentData && item.userData) {
      setSelectedMomentInfo({
        moment: item.momentData,
        user: item.userData,
        type: "moment",
      });

      router.push('/stack' as RelativePathString);
    }
  };




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
        {item.type === "moment" && (
          <Pressable onPress={() => onPressMore?.(item)}>
            <Feather name="more-horizontal" size={20} color="#555" />
          </Pressable>
        )}
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
                shadowColor: "#000",
                shadowOpacity: 1,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 2 },
                elevation: 6,
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
                top: "50%",
                left: "50%",
                transform: [{ translateX: -14 }, { translateY: -14 }],
                shadowColor: "#000",
                shadowOpacity: 1,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 2 },
                elevation: 6,
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
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [userStacks, setUserStacks] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [albums, setAlbums] = useState<MasonryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loadingMoments, setLoadingMoments] = useState(false);
  const [userMoments, setUserMoments] = useState<MomentInfo[]>([]);


  const router = useRouter();
  const setSelectedMomentInfo = useMomentInfoStore((s) => s.setSelectedMomentInfo);
  const { tabHeight } = useTabBar();
  const [myProfilePic, setMyProfilePic] = useState<string | null>(null);

  // For Add to Stack modal
  const [addToStackVisible, setAddToStackVisible] = useState(false);

  // For Create New Stack modal
  const [createStackVisible, setCreateStackVisible] = useState(false);

  // Form inputs for new stack
  const [newStackTitle, setNewStackTitle] = useState("");
  const [newStackDescription, setNewStackDescription] = useState("");
  const [newStackVisibility, setNewStackVisibility] = useState(true); // public by default
  const [stackCover, setStackCover] = useState<string | null>(null);


  // Selected moments for new stack
  const [selectedMoments, setSelectedMoments] = useState<MasonryItem[]>([]);
  const [isMomentPickerVisible, setMomentPickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAllContent(); // Refresh content whenever screen gains focus
      fetchActiveStories();
    }, [])
  );


  useEffect(() => {
    if (isMomentPickerVisible) {
      fetchUserMoments();
    }
  }, [isMomentPickerVisible]);

  async function fetchUserMoments() {
    setLoadingMoments(true);

    try {
      // Get the user's JWT token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        console.error("No valid session found");
        setLoadingMoments(false);
        return;
      }

      const userToken = session.access_token;

      // Fetch moments from your API
      const res = await fetch(`${NGROK_URL}/api/moments`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch moments");

      const data = await res.json();
      setUserMoments(data);
    } catch (err) {
      console.error("Error fetching moments:", err);
    } finally {
      setLoadingMoments(false);
    }
  }

  const openMomentPicker = () => {
    setMomentPickerVisible(true);
  };

  const closeMomentPicker = () => {
    setMomentPickerVisible(false);
  };


  useEffect(() => {
    const fetchMyProfile = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const { data: userData, error } = await supabase
        .from("users")
        .select("pfp_url")
        .eq("id", userId)
        .single();

      if (error) return console.error(error);

      const pfp = await fetchProfilePictureUrl(userData?.pfp_url);
      setMyProfilePic(pfp);
    };

    fetchMyProfile();
  }, []);


  const loadFonts = async () => {
    await Font.loadAsync({
      "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
      "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
      "Lato": require("@/fonts/Lato-Regular.ttf"),
      "LatoBold": require("@/fonts/Lato-Bold.ttf"),
      "LatoItalic": require("@/fonts/Lato-Italic.ttf")
    });
    setFontsLoaded(true);
  };

  const acceptFriendRequest = async (notificationId: string, senderId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    try {
      // Add to friends table
      await supabase.from("friends").insert([
        { user_id: userId, friend_id: senderId },
        { user_id: senderId, friend_id: userId }
      ]);

      // Mark notification as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      // Remove locally
      setFriendRequests((prev) => prev.filter(n => n.id !== notificationId));

      alert("Friend request accepted!");
    } catch (err) {
      console.error(err);
    }
  };


  const declineFriendRequest = async (notificationId: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);

      setFriendRequests((prev) => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error(err);
    }
  };


  const fetchFriendRequests = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select(`
      id,
      sender_id,
      type,
      content,
      created_at,
      users!notifications_sender_id_fkey(id, username, pfp_url)
    `)
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    // Fetch actual profile picture URLs
    const processedData = await Promise.all(
      (data || []).map(async (notif) => {
        const profileUrl = await fetchProfilePictureUrl(notif.users.pfp_url);
        return { ...notif, users: { ...notif.users, profileUrl } };
      })
    );

    setFriendRequests(processedData);
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

  const fetchActiveStories = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const res = await fetch(`${NGROK_URL}/api/story_moments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to fetch stories:", err);
        return;
      }

      const data = await res.json();

      // Process the stories into the shape your frontend expects
      const processed = await Promise.all(
        (data || []).map(async (story: any) => {
          const profileUrl = await fetchProfilePictureUrl(story.users.pfp_url);
          return {
            id: story.id,
            userId: story.user_id,
            username: story.users.username,
            profilePic: profileUrl,
            momentData: { id: story.id, cover_url: story.cover_url },
            userData: { name: story.users.username, profilePic: profileUrl },
          };
        })
      );

      console.log("Processed stories:", processed);

      const userId = await getCurrentUserId();
      const myStory = processed.find((story) => story.userId === userId);
      const otherStories = processed.filter((story) => story.userId !== userId);

      setStories(myStory ? [myStory, ...otherStories] : otherStories);
    } catch (err) {
      console.error("Error fetching active stories:", err);
    }
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

      // Apply friends filter
      const filteredContent = allContent.filter(item => {
        if (activeFilter === "Friends") {
          return friends.includes(item.user_id);
        }
        return true;
      });

      filteredContent.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const processedAlbums = await Promise.all(
        filteredContent.map(async (item) => {
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
                id: item.id, // DB UUID 
                spotifyId: trackId || null,
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

  // Load fonts and fetch friends on mount
  useEffect(() => {
    loadFonts();
    fetchFriends().then(() => fetchActiveStories());
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

  const handleStoryPress = async (story: StoryItem) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("No access token");

      const res = await fetch(`${NGROK_URL}/api/story_moments/${story.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure response is JSON
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response format: ${text}`);
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch story");
      }

      const data = await res.json();

      const userData = Array.isArray(data.users) ? data.users[0] : data.users;
      const pfpUrl = await fetchProfilePictureUrl(userData?.pfp_url);
      const coverUrl = await fetchCoverImageUrl(data.cover_url);
      const trackId = extractTrackId(data.song_url);

      setSelectedMomentInfo({
        moment: {
          id: data.id,
          spotifyId: trackId || null,
          title: data.title,
          artist: data.description || "Unknown Artist",
          songStart: data.start_time || 0,
          songDuration: data.duration || 30,
          length: 180,
          album: coverUrl ? { uri: coverUrl } : require("@/assets/images/album1.jpeg"),
          waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
        },
        user: {
          name: userData?.username || "Unknown User",
          profilePic: pfpUrl,
        },
        type: "story",
      });

      router.push('/stack' as RelativePathString);

    } catch (err) {
      console.error("Error handling story press:", err);
      alert(`Failed to open story: ${err.message}`);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setStackCover(result.assets[0].uri);
    }
  };

  // Add a moment to selected moments (up to 5)
  const addSelectedMoment = (moment: MasonryItem) => {
    if (selectedMoments.length >= 5) {
      Alert.alert("Limit reached", "You can only add up to 5 moments");
      return;
    }
    setSelectedMoments([...selectedMoments, moment]);
  };

  const removeSelectedMoment = (id: string) => {
    setSelectedMoments(selectedMoments.filter((m) => m.id !== id));
  };




  return (
    <View style={{ flex: 1, backgroundColor: "#FFF0E2" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SpinStack</Text>
        <Pressable
          onPress={() => {
            fetchFriendRequests();
            setNotificationsVisible(true);
          }}
          style={styles.bellIcon}
        >
          <Feather name="bell" size={28} color="#333C42" />
        </Pressable>

      </View>

      {/* Stories Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 12, paddingHorizontal: 16 }}
      >

        {/* Your own story circle */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/create",
              params: { isStory: "true" }, // flag to create a story, not a moment
            })
          }
          style={{ alignItems: "center", marginRight: 14 }}
        >
          <View
            style={{
              width: 65,
              height: 65,
              borderRadius: 33,
              borderWidth: 3,
              borderColor: "#ff5c5c",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={myProfilePic ? { uri: myProfilePic } : require("@/assets/images/profile.png")}
              style={{ width: 58, height: 58, borderRadius: 29 }}
            />
            {/* Plus Button */}
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: [{ translateX: -11 }, { translateY: -11 }], // half of icon size
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#ff5c5c",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
            >
              <Feather name="plus" size={14} color="#fff" />
            </View>

          </View>
          <Text style={{ marginTop: 4, color: "#333C42", fontSize: 13 }}>You</Text>
        </Pressable>

        {/* Friends’ stories */}
        {stories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => handleStoryPress(story)}
            style={{ alignItems: "center", marginRight: 14 }}
          >
            <View
              style={{
                width: 65,
                height: 65,
                borderRadius: 33,
                borderWidth: 3,
                borderColor: "#ff5c5c",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={
                  story.profilePic
                    ? { uri: story.profilePic }
                    : require("@/assets/images/profile.png")
                }
                style={{ width: 58, height: 58, borderRadius: 29 }}
              />
            </View>
            <Text style={{ marginTop: 4, color: "#333C42", fontSize: 13 }}>
              {story.username}
            </Text>
          </Pressable>
        ))}
      </ScrollView>




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
              {friendRequests.length === 0 ? (
                <Text style={{ color: "#333C42", fontFamily: "Lato" }}>
                  No notifications yet 📭
                </Text>
              ) : (
                <ScrollView style={{ width: "100%" }}>
                  {friendRequests.map((req) => (
                    <View key={req.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                      <Image
                        source={req.users.profileUrl ? { uri: req.users.profileUrl } : require("@/assets/images/profile.png")}
                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                      />
                      <Text style={{ flex: 1, fontFamily: "Lato", color: "#333C42" }}>
                        {req.type === "friend_request"
                          ? `${req.users.username} sent you a friend request`
                          : req.type === "like"
                            ? `${req.users.username} liked your moment`
                            : req.message}
                      </Text>

                      {req.type === "friend_request" && (
                        <>
                          <Pressable onPress={() => acceptFriendRequest(req.id, req.sender_id)}>
                            <Text style={{ color: "green", marginRight: 10 }}>Accept</Text>
                          </Pressable>
                          <Pressable onPress={() => declineFriendRequest(req.id)}>
                            <Text style={{ color: "red" }}>Decline</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  ))}

                </ScrollView>
              )}
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
              <ScrollView style={{ width: "100%" }}>
                {userStacks.length === 0 ? (
                  <Text style={{ textAlign: "center", color: "#333C42", fontFamily: "Lato" }}>
                    No stacks yet
                  </Text>
                ) : (
                  userStacks.map((stack) => (
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
          </View>
        </View>
      </Modal>

      {/* Feed Section */}
      {albums.length > 0 ? (
        <Masonry
          data={albums}
          spacing={10}
          columns={2}
          router={router}
          onPressMore={handleMorePress}
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
    fontFamily: "Lato",
    fontSize: 34,
    paddingTop: 60,
    marginLeft: 97,
    alignSelf: "center",
    color: "#333C42",
    fontWeight: 600
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
  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
    color: '#333C42',
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
    fontFamily: "Lato",
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
    fontFamily: "Lato",
  },
  time: {
    fontSize: 11,
    color: "#777",
    fontFamily: "Lato",
  },
  caption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#333C42",
    fontFamily: "Lato",
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
    fontFamily: "Lato",
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
    fontFamily: "Lato",
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
    fontFamily: "Lato",
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    width: "100%",
    marginBottom: 10,
  },
  momentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333C42",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginVertical: 5,
    borderRadius: 12,
  },
  addButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  addButtonText: {
    fontWeight: "bold",
    color: "#333C42",
  },
  saveButton: {
    backgroundColor: "#333C42",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  momentPickerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 20,
    paddingTop: 50,
  },

  momentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
  },

  momentImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },

  momentTitle: {
    color: "#fff",
    fontSize: 16,
  },

  closePickerBtn: {
    marginTop: 20,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#555",
    borderRadius: 8,
  },

  closePickerText: {
    color: "#fff",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },

});