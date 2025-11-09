import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { RelativePathString, useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/_context/AuthContext";
import { authenticateSpotify, hasSpotifyAuth, clearSpotifyTokens, getValidSpotifyToken } from "../utils/spotifyAuth";
import { useMomentInfoStore } from "../stores/useMomentInfoStore";
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigationState } from '@react-navigation/native';

export default function ProfileScreen() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  const { user, pfpUrl, setPfpUrl, logout } = useAuth();
  const router = useRouter();
  const setSelectedMomentInfo = useMomentInfoStore((s) => s.setSelectedMomentInfo);

  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const [numFriends, setNumFriends] = useState<number>(0);
  const [moments, setMoments] = useState<any[]>([]);
  const [stacks, setStacks] = useState<any[]>([]);
  const [loadingMoments, setLoadingMoments] = useState(true);
  const [loadingStacks, setLoadingStacks] = useState(true);
  const [viewMode, setViewMode] = useState<"moments" | "stacks">("moments");
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [authorizingSpotify, setAuthorizingSpotify] = useState(false);
  const [createStackVisible, setCreateStackVisible] = useState(false);

  const [newStackTitle, setNewStackTitle] = useState("");
  const [newStackDescription, setNewStackDescription] = useState("");
  const [selectedMoments, setSelectedMoments] = useState<any[]>([]);
  const [isMomentPickerVisible, setIsMomentPickerVisible] = useState(false);
  const [userMoments, setUserMoments] = useState<any[]>([]);
  const [loadingMomentsForPicker, setLoadingMomentsForPicker] = useState(false);
  const [stackImageUri, setStackImageUri] = useState<string | null>(null);
  const [stackImageFileName, setStackImageFileName] = useState<string | null>(null);




  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  const POLAROID_WIDTH = 150;
  const POLAROID_HEIGHT = 200;
  const POLAROID_URL = require("../../assets/images/polaroidFrame.webp");
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  const onImageSelected = (uri: string, fileName: string) => {
    setStackImageUri(uri);
    setStackImageFileName(fileName);
  };



  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;
      const image = result.assets[0];

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
      );

      // Use timestamp for unique filename
      const timestamp = Date.now();
      const fileName = `user_${user?.id}_stack_${timestamp}.webp`;
      const fileType = 'image/webp';

      // Get presigned URL
      const uploadUrlRes = await fetch(`${nUrl}/api/upload/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType }),
      });

      const { uploadURL } = await uploadUrlRes.json();

      const fileData = await fetch(manipulatedImage.uri);
      const blob = await fileData.blob();

      // Upload to S3
      const s3Res = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: blob,
      });

      if (!s3Res.ok) {
        Alert.alert('Upload Error', 'Failed to upload image to S3.');
        return;
      }

      // Update parent state
      onImageSelected(manipulatedImage.uri, fileName);
      Alert.alert('Success', 'Stack image uploaded!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while picking the image.');
    }
  };



  const openCreateStackModal = async () => {
    setCreateStackVisible(true);

    // Fetch moments for selection
    if (!user?.id) return;

    try {
      setLoadingMomentsForPicker(true);
      const { data, error } = await supabase
        .from("moments")
        .select("id, cover_url, title, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserMoments(data || []);
    } catch (err) {
      console.error("Error fetching moments for picker:", err);
    } finally {
      setLoadingMomentsForPicker(false);
    }
  };

  const addSelectedMoment = (moment: any) => {
    if (selectedMoments.length < 5) {
      setSelectedMoments([...selectedMoments, moment]);
    }
  };

  const removeSelectedMoment = (id: string) => {
    setSelectedMoments(selectedMoments.filter(m => m.id !== id));
  };

  const fetchUserStacks = async () => {
    if (!user?.id) return;

    try {
      setLoadingStacks(true);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const response = await fetch(`${nUrl}/stacks?userId=${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching stacks:", errorData);
        Alert.alert("Error", errorData.error || "Failed to fetch stacks");
        return;
      }

      const data = await response.json();
      setStacks(data || []);
    } catch (err) {
      console.error("Unexpected error fetching stacks:", err);
      Alert.alert("Error", "Something went wrong while fetching stacks");
    } finally {
      setLoadingStacks(false);
    }
  };


  const createStack = async () => {
    if (!newStackTitle.trim() || selectedMoments.length === 0) {
      Alert.alert("Error", "Please provide a title and select at least one moment.");
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      console.log("Creating stack with:", {
        title: newStackTitle,
        description: newStackDescription,
        firstMomentId: selectedMoments[0].id,
        totalMoments: selectedMoments.length,
      });

      const timestamp = Date.now();
      const payload = {
        title: newStackTitle,
        description: newStackDescription || null,
        cover_url: stackImageFileName || `user_${user?.id}_stack_${timestamp}.webp`,
        visibility: true,
        firstMomentId: selectedMoments[0].id,
      };

      // Step 1: Create the stack with first moment
      const response = await fetch(`${nUrl}/api/stacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Create stack error:", data);
        Alert.alert("Error", data.error || "Failed to create stack");
        return;
      }

      console.log("✅ Stack created:", data);

      // Step 2: Add remaining moments (if more than 1)
      if (selectedMoments.length > 1) {
        console.log(`Adding ${selectedMoments.length - 1} additional moments...`);

        for (let i = 1; i < selectedMoments.length; i++) {
          const momentId = selectedMoments[i].id;

          console.log(`Adding moment ${i + 1}/${selectedMoments.length}:`, momentId);

          const addRes = await fetch(`${nUrl}/api/stacks/${data.id}/moments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ momentId }),
          });

          if (!addRes.ok) {
            const errData = await addRes.json();
            console.error(`❌ Failed to add moment ${i + 1}:`, errData);
            // Don't show alert for each failure, just log it
          } else {
            const addResult = await addRes.json();
            console.log(`✅ Added moment ${i + 1}:`, addResult);
          }
        }
      }

      // Step 3: Reset modal FIRST
      resetCreateStackModal();

      // Step 4: Show success alert
      Alert.alert("Success", `Stack created with ${selectedMoments.length} moment(s)!`);

      // Step 5: Refresh stacks (after modal is closed)
      await fetchStacks();

    } catch (err: any) {
      console.error("Unexpected error creating stack:", err);
      Alert.alert("Error", "Something went wrong while creating the stack");
    }
  };





  // Extract track ID from Spotify URL
  const extractTrackId = (songUrl: string): string | null => {
    if (!songUrl) return null;
    const match = songUrl.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Check Spotify connection status on mount and when focused
  useFocusEffect(
    React.useCallback(() => {
      const checkSpotifyConnection = async () => {
        const hasAuth = await hasSpotifyAuth();
        setSpotifyConnected(hasAuth);

        if (hasAuth) {
          console.log('✅ User has valid Spotify authentication');
        }
      };
      checkSpotifyConnection();
    }, [])
  );

  const handleStackPress = (stack: any) => {
    console.log("Stack pressed:", stack.id);
    router.push(`/stackViewer?id=${stack.id}` as RelativePathString);
  };

  // Update fetchStacks to resolve cover URLs
  const fetchStacks = async () => {
    if (!user?.id) return;

    try {
      setLoadingStacks(true);
      const { data, error } = await supabase
        .from("stacks")
        .select("id, cover_url, title, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("STACKS FROM SUPABASE:", data);
      console.log("STACKS ERROR:", error);
      console.log("CURRENT USER ID:", user.id);

      // Resolve cover image URLs
      const stacksWithResolvedCovers = await Promise.all(
        (data || []).map(async (stack) => {
          const resolvedCoverUrl = await fetchCoverImageUrl(stack.cover_url);
          return {
            ...stack,
            cover_url: resolvedCoverUrl || stack.cover_url,
          };
        })
      );

      setStacks(stacksWithResolvedCovers);
    } catch (err) {
      console.error("Error fetching stacks:", err);
    } finally {
      setLoadingStacks(false);
    }
  };

  const fetchCoverImageUrl = async (coverPath: string | null): Promise<string | null> => {
    if (!coverPath) return null;

    // If it's already a full URL, return it
    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      return coverPath;
    }

    // Otherwise, fetch from API
    try {
      const res = await fetch(`${nUrl}/api/upload/download-url/${coverPath}`);
      if (res.ok) {
        const { downloadURL } = await res.json();
        return downloadURL;
      }
    } catch (err) {
      console.error("Failed to fetch cover image URL:", err);
    }
    return null;
  };
  const handleConnectSpotify = async () => {
    try {
      setIsConnectingSpotify(true);

      // Use the updated authentication function
      const token = await authenticateSpotify();

      if (!token) {
        throw new Error("Failed to get access token");
      }

      setSpotifyConnected(true);

      Alert.alert(
        "Success! 🎉",
        "Your Spotify account has been connected. Your session will be maintained automatically.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Spotify connection error:", error);
      Alert.alert(
        "Error",
        error?.message || "An error occurred while connecting to Spotify.",
        [{ text: "OK" }]
      );
    } finally {
      setIsConnectingSpotify(false);
    }
  };

  // Disconnect Spotify
  const handleDisconnectSpotify = async () => {
    Alert.alert(
      "Disconnect Spotify",
      "Are you sure you want to disconnect your Spotify account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await clearSpotifyTokens();
              setSpotifyConnected(false);
              Alert.alert("Disconnected", "Spotify has been disconnected");
            } catch (err) {
              console.error("Error disconnecting Spotify:", err);
              Alert.alert("Error", "Failed to disconnect Spotify");
            }
          },
        },
      ]
    );
  };

  // Test token refresh (optional - for debugging)
  const testTokenRefresh = async () => {
    try {
      const token = await getValidSpotifyToken();
      if (token) {
        Alert.alert("Success", "Token is valid and refreshed if needed");
      } else {
        Alert.alert("Error", "Failed to get valid token. Please reconnect.");
      }
    } catch (error) {
      console.error("Token test error:", error);
      Alert.alert("Error", "Failed to validate token");
    }
  };

  const getSpotifyTrackLength = async (trackId: string, token: string): Promise<number | null> => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch track data");
      const data = await res.json();
      return data.duration_ms / 1000; // Convert to seconds
    } catch (err) {
      console.error("Error fetching Spotify track length:", err);
      return null;
    }
  };

  // Fetch user info
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserInfo = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("username, bio, pfp_url")
          .eq("id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user info:", userError);
          return;
        }

        setUsername(userData?.username ?? "Unknown");
        setBio(userData?.bio ?? "");

        if (userData?.pfp_url) {
          try {
            const res = await fetch(
              `${nUrl}/api/upload/download-url/${userData.pfp_url}`
            );
            if (res.ok) {
              const { downloadURL } = await res.json();
              setPfpUrl(downloadURL);
            } else {
              console.error("Failed to fetch presigned URL:", res.status);
            }
          } catch (err) {
            console.error("Error fetching presigned URL:", err);
          }
        }

        const { count, error: friendsError } = await supabase
          .from("friends")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (friendsError) {
          console.error("Error fetching friends count:", friendsError);
        } else {
          setNumFriends(count ?? 0);
        }
      } catch (err) {
        console.error("Unexpected error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [user?.id]);

  // Fetch moments
  useEffect(() => {
    if (!user?.id) return;

    const fetchMoments = async () => {
      try {
        setLoadingMoments(true);
        const { data, error } = await supabase
          .from("moments")
          .select("id, cover_url, title, description, created_at, song_url, start_time, duration")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMoments(data || []);
      } catch (err) {
        console.error("Error fetching moments:", err);
      } finally {
        setLoadingMoments(false);
      }
    };

    fetchMoments();
  }, [user?.id]);


  // fetch stacks on app load
  useEffect(() => {
    fetchStacks();
  }, [user?.id]);


  const fetchFriendsList = async () => {
    if (!user?.id) return;
    setLoadingFriends(true);

    try {
      const { data: friendLinks, error: linkError } = await supabase
        .from("friends")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (linkError) throw linkError;
      if (!friendLinks || friendLinks.length === 0) {
        setFriendsList([]);
        return;
      }

      const friendIds = friendLinks.map(row =>
        row.user_id === user.id ? row.friend_id : row.user_id
      ).filter(id => id !== user.id);

      if (friendIds.length === 0) {
        setFriendsList([]);
        return;
      }

      const { data: friendProfiles, error: profileError } = await supabase
        .from("users")
        .select("id, username, bio, pfp_url")
        .in("id", friendIds);

      if (profileError) throw profileError;

      const resolvedProfiles = await Promise.all(
        friendProfiles.map(async (f) => {
          let pfp = null;
          if (f.pfp_url) {
            try {
              const res = await fetch(
                `${nUrl}/api/upload/download-url/${f.pfp_url}`
              );
              if (res.ok) {
                const { downloadURL } = await res.json();
                pfp = downloadURL;
              }
            } catch (err) {
              console.error("Failed to load friend pfp:", err);
            }
          }
          return { ...f, pfp_url: pfp };
        })
      );

      setFriendsList(resolvedProfiles);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const stackExists = useNavigationState(state =>
    state.routes.some(route => route.name === 'stack')
  );

  const handleMomentPress = async (moment: any) => {
    console.log(moment);
    if (!spotifyConnected) {
      console.log("spotify not connected");
      Alert.alert(
        "Spotify Not Connected",
        "Please connect your Spotify account to play moments.",
        [{ text: "OK" }]
      );
      return;
    }

    const trackId = extractTrackId(moment.song_url);
    const token = await getValidSpotifyToken(); // Use the new token refresh function

    if (trackId && token) {
      const length = await getSpotifyTrackLength(trackId, token);
      if (length) moment.length = length;
    }
    setSelectedMomentInfo({
      moment: {
        id: moment.id,
        spotifyId: trackId || null,
        title: moment.title,
        artist: moment.description || "Unknown Artist",
        songStart: moment.start_time || 0,
        songDuration: moment.duration || 30,
        length: moment.length || 180,
        album: moment.cover_url ? { uri: moment.cover_url } : require("../../assets/images/album1.jpeg"),
        waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
      },
      user: {
        name: username,
        profilePic: pfpUrl,
      },
      type: "moment",
    });




    if (true) {
      console.log("Replacing existing /stack screen");
      router.replace('/stack' as RelativePathString);
    } else {
      console.log("Pushing new /stack screen");
    }
  };

  const resetCreateStackModal = () => {
    setCreateStackVisible(false);          // Close modal
    setNewStackTitle("");                   // Clear title
    setNewStackDescription("");             // Clear description
    setSelectedMoments([]);                 // Clear selected moments
    setStackImageUri(null);                 // Clear uploaded image URI
    setStackImageFileName(null);            // Clear uploaded image filename
    setUserMoments([]);                     // Clear available moments
    setLoadingMomentsForPicker(false);      // Reset picker loading state
    setIsMomentPickerVisible(false);        // Close moment picker if open
  };


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", paddingLeft: 120 }}>
        <Text style={styles.header}>Profile</Text>
        <View style={{ alignSelf: "center", marginLeft: 90 }}>
          <Pressable onPress={() => router.push("/profileSettings" as RelativePathString)}>
            <Feather name="settings" size={30} color="#333C42" />
          </Pressable>
        </View>
      </View>



      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, paddingHorizontal: 20 }}>
        <Image
          source={pfpUrl ? { uri: pfpUrl } : require("../../assets/images/profile.png")}
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: IMAGE_SIZE / 2,
          }}
        />
        <View style={{ flex: 1, alignItems: "flex-start", justifyContent: "center", paddingHorizontal: 10 }}>
          <Text style={{ fontSize: 20, fontFamily: "Lato", color: "#333C42", fontWeight: "500" }}
            numberOfLines={1} ellipsizeMode="tail">
            {username}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Lato", color: "#333C42", textAlign: "center", }}
            numberOfLines={2} ellipsizeMode="tail">
            "{bio || 'loading...'}"
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={async () => {
              await fetchFriendsList();
              setFriendsModalVisible(true);
            }}
          >
            <Text style={{
              fontSize: 14,
              color: "#333C42",
              textDecorationLine: "underline",
              fontFamily: "Lato",
              marginBottom: 8,
            }}>
              {numFriends} Friends
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Spotify Connection Button */}
      <View style={{ width: "90%", alignItems: "center", marginTop: 15 }}>
        {spotifyConnected ? (
          <View style={{ width: '100%', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={handleDisconnectSpotify}
              style={{
                backgroundColor: "#1DB954",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: "#333C42",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Feather name="check-circle" size={18} color="#FFF0E2" />
              <Text style={{ color: "#FFF0E2", fontFamily: "Jacques Francois", fontSize: 14 }}>
                Spotify Connected (Tap to Disconnect)
              </Text>
            </Pressable>

            {/* Optional: Debug button to test token refresh */}
            {__DEV__ && (
              <Pressable
                onPress={testTokenRefresh}
                style={{
                  backgroundColor: "#333C42",
                  paddingVertical: 6,
                  paddingHorizontal: 15,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#FFF0E2", fontFamily: "Jacques Francois", fontSize: 12 }}>
                  Test Token Refresh
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            onPress={handleConnectSpotify}
            disabled={isConnectingSpotify}
            style={{
              backgroundColor: "#1DB954",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: "#333C42",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              opacity: isConnectingSpotify ? 0.6 : 1,
            }}
          >
            {isConnectingSpotify ? (
              <ActivityIndicator size="small" color="#FFF0E2" />
            ) : (
              <Feather name="music" size={18} color="#FFF0E2" />
            )}
            <Text style={{ color: "#FFF0E2", fontFamily: "Lato", fontSize: 14 }}>
              {isConnectingSpotify ? "Connecting..." : "Connect Spotify"}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8, width: "100%", justifyContent: "space-between", paddingHorizontal: 20 }}>
          <Pressable onPress={openCreateStackModal}>
            <Feather name="plus-circle" size={28} color="#333C42" />
          </Pressable>


          <Text style={{ fontSize: 24, color: "#333C42", fontWeight: "500", fontFamily: "Lato" }}>
            {viewMode === "moments" ? "Moments" : "Stacks"}
          </Text>
          <Pressable onPress={() => setViewMode(prev => (prev === "moments" ? "stacks" : "moments"))}>
            <Feather name="filter" size={28} color="#333C42" />
          </Pressable>
        </View>

        <View style={{ flex: 1, width: "100%", paddingHorizontal: 15, paddingTop: 10 }}>
          <View style={{ display: viewMode === "moments" ? "flex" : "none", flex: 1 }}>
            {loadingMoments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#333C42" />
              </View>
            ) : moments.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={{ color: "#333C42", fontFamily: "Lato" }}>No moments yet 😢</Text>
              </View>
            ) : (
              <FlatList
                data={moments}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={{ flex: 1, margin: 6, alignItems: "center" }}
                    onPress={() => handleMomentPress(item)}
                  >
                    <Image
                      source={{ uri: item.cover_url }}
                      style={{
                        width: Dimensions.get("window").width / 2 - 24,
                        height: Dimensions.get("window").width / 2 - 24,
                        borderRadius: 20,
                        backgroundColor: "#eaeaea",
                      }}
                      resizeMode="cover"
                    />
                    <View style={{ width: Dimensions.get("window").width / 2 - 24, marginTop: 6 }}>
                      <Text style={{ fontFamily: "Lato", fontSize: 15, color: "#333C42" }} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={{ fontFamily: "Lato", fontSize: 13, color: "#555" }} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>

          <View style={{ display: viewMode === "stacks" ? "flex" : "none", flex: 1 }}>
            {loadingStacks ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#333C42" />
              </View>
            ) : stacks.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>No stacks yet 😢</Text>
              </View>
            ) : (
              <FlatList
                data={stacks}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.momentContainer}
                    onPress={() => handleStackPress(item)}
                  >
                    <Image
                      source={
                        item.cover_url
                          ? { uri: item.cover_url }
                          : require("../../assets/images/album1.jpeg")
                      }
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <Image
                      source={POLAROID_URL}
                      style={{
                        width: POLAROID_WIDTH * 1,
                        height: POLAROID_HEIGHT * 1.5,
                        position: "absolute",
                        resizeMode: "contain",
                      }}
                    />
                    <View style={[styles.textOnTop, { bottom: 10 }]}>
                      <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.captionText} numberOfLines={1}>{item.description}</Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={friendsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFriendsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Friends</Text>
              <Pressable onPress={() => setFriendsModalVisible(false)}>
                <Feather name="x" size={26} color="#333C42" />
              </Pressable>
            </View>

            {loadingFriends ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#333C42" />
              </View>
            ) : friendsList.length === 0 ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>No friends yet 😢</Text>
              </View>
            ) : (
              <FlatList
                data={friendsList}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.friendRow}
                    onPress={() => {
                      setFriendsModalVisible(false);
                      router.push({
                        pathname: '/profile/[id]' as RelativePathString,
                        params: { id: item.id, fromProfile: 'true' },
                      });
                    }}
                  >
                    <Image
                      source={item.pfp_url ? { uri: item.pfp_url } : require("../../assets/images/profile.png")}
                      style={styles.friendAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.friendName}>{item.username}</Text>
                      <Text style={styles.friendBio} numberOfLines={1}>
                        "{String(item.bio || "No bio")}"
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ➕ Create New Stack Modal */}
      <Modal
        visible={createStackVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateStackVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.friendsPopup, { height: "85%" }]}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header */}
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>Create New Stack</Text>
                <Pressable onPress={() => setCreateStackVisible(false)}>
                  <Feather name="x" size={26} color="#333C42" />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Stack Image Picker */}
                <View style={{ alignItems: "center", marginBottom: 10 }}>
                  <View style={{ alignItems: 'center', marginBottom: 10 }}>
                    <Pressable
                      onPress={pickImage} // opens the image picker
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: "#f0f0f0",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {/* Show selected image if available */}
                      {stackImageUri && (
                        <Image
                          source={{ uri: stackImageUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      )}

                      {/* Plus icon always visible on top */}
                      <View
                        style={{
                          position: "absolute",
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#ff5c5c",
                          justifyContent: "center",
                          alignItems: "center",
                          bottom: 8,
                          right: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 3,
                          elevation: 4,
                        }}
                      >
                        <Feather name="plus" size={18} color="#fff" />
                      </View>
                    </Pressable>

                  </View>
                  {/* Label below the image picker */}
                  <Text style={{ color: "#666", fontSize: 14, marginTop: 5 }}>
                    {stackImageUri ? "Replace your Custom Stack Image" : "Add a custom stack image"}
                  </Text>
                </View>


                {/* Stack Title */}
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Stack title"
                  value={newStackTitle}
                  onChangeText={setNewStackTitle}
                />

                {/* Stack Description */}
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Add a description..."
                  value={newStackDescription}
                  onChangeText={setNewStackDescription}
                />

                {/* Moments Picker */}
                <Text style={styles.label}>Select Moments ({selectedMoments.length}/5)</Text>
                {loadingMomentsForPicker ? (
                  <ActivityIndicator size="small" color="#333C42" />
                ) : (
                  <FlatList
                    data={userMoments}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => {
                      const isSelected = selectedMoments.some(m => m.id === item.id);
                      return (
                        <TouchableOpacity
                          style={[styles.momentChip, isSelected && { backgroundColor: "#4CAF50" }]}
                          onPress={() => {
                            if (isSelected) removeSelectedMoment(item.id);
                            else if (selectedMoments.length < 5) addSelectedMoment(item);
                          }}
                        >
                          <Image
                            source={{ uri: item.cover_url }}
                            style={{ width: 50, height: 50, borderRadius: 8, marginRight: 5 }}
                          />
                          <Text style={{ color: "#fff", maxWidth: 70 }} numberOfLines={1}>
                            {item.title || "Untitled"}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}

                {/* Selected Moments Preview */}
                {selectedMoments.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {selectedMoments.map((moment) => (
                      <View key={moment.id} style={styles.momentChip}>
                        <Text style={{ color: "#fff", fontSize: 12 }} numberOfLines={1}>
                          {moment.title || "Untitled"}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeSelectedMoment(moment.id)}
                          style={{ marginLeft: 5 }}
                        >
                          <Feather name="x" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={{ color: "#666", marginBottom: 10, fontStyle: "italic" }}>
                    No moments selected yet
                  </Text>
                )}



                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, { opacity: selectedMoments.length === 0 ? 0.5 : 1 }]}
                  onPress={createStack}
                  disabled={selectedMoments.length === 0}
                >
                  <Text style={styles.saveButtonText}>Create Stack</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 75,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFF0E2",
  },
  header: {
    fontSize: 40,
    fontWeight: "700",
    color: "#333C42",
    fontFamily: 'Lato',
  },
  content: {
    flex: 1,
    marginTop: 20,
    borderRadius: 10,
    width: "97%",
    backgroundColor: "#8DD2CA",
    alignItems: "center",
  },
  momentContainer: {
    position: "relative",
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",

  },
  coverImage: {
    width: "88%",
    height: "88%",
  },
  textOnTop: {
    position: "absolute",
    width: "90%",
    alignItems: "center",
  },
  titleText: {
    color: "#030303ff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Lato",
  },
  captionText: {
    color: "#333C42",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Lato",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    height: "60%",
    backgroundColor: "#FFF0E2",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Lato",
    color: "#333C42",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  friendAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  friendName: {
    fontSize: 16,
    color: "#333C42",
    fontFamily: "Lato",
  },
  friendBio: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Lato",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  friendsPopup: {
    width: "90%",
    backgroundColor: "#FFF0E2",
    borderRadius: 20,
    overflow: "hidden",
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333C42",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333C42",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  momentChip: {
    flexDirection: "row",
    backgroundColor: "#333C42",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#333C42",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

});