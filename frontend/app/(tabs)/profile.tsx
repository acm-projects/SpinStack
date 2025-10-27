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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { RelativePathString, useRouter } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/_context/AuthContext";
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

export default function ProfileScreen() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  const { user, pfpUrl, setPfpUrl, logout } = useAuth();
  const router = useRouter();

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

  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const POLAROID_WIDTH = 150;
  const POLAROID_HEIGHT = 200;
  const POLAROID_URL = require("../../assets/images/polaroidFrame.webp");
<<<<<<< Updated upstream
=======

  // Check if Spotify is authorized
  useEffect(() => {
    const checkSpotifyAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('spotifyToken');
        setSpotifyToken(storedToken);
      } catch (err) {
        console.error("Error checking Spotify token:", err);
      }
    };
    checkSpotifyAuth();
  }, []);

  // Spotify Authorization Function
  const authorizeSpotify = async () => {
    try {
      setAuthorizingSpotify(true);
      const session = await Spotify.Authenticate.authenticateAsync({
        scopes: [
          "user-read-currently-playing",
          "user-read-playback-state",
          "user-modify-playback-state",
          "app-remote-control",
        ],
      });

      if (!session?.accessToken) {
        throw new Error("No access token received");
      }

      // Store the token
      await SecureStore.setItemAsync('spotifyToken', session.accessToken);
      setSpotifyToken(session.accessToken);
      
      Alert.alert("Success!", "Spotify authorized successfully");
    } catch (e: any) {
      console.error("Spotify auth error:", e);
      Alert.alert("Authorization Failed", e?.message || "Could not authorize Spotify");
    } finally {
      setAuthorizingSpotify(false);
    }
  };

  // Disconnect Spotify
  const disconnectSpotify = async () => {
    try {
      await SecureStore.deleteItemAsync('spotifyToken');
      setSpotifyToken(null);
      Alert.alert("Disconnected", "Spotify has been disconnected");
    } catch (err) {
      console.error("Error disconnecting Spotify:", err);
    }
  };
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
              `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${userData.pfp_url}`
=======
              `https://nonfraudulently-photoemissive-syreeta.ngrok-free.dev/api/upload/download-url/${userData.pfp_url}`
>>>>>>> Stashed changes
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
          .select("id, cover_url, title, description, created_at")
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

  // Fetch stacks
  useEffect(() => {
    if (!user?.id) return;

    const fetchStacks = async () => {
      try {
        setLoadingStacks(true);
        const { data, error } = await supabase
          .from("stacks")
          .select("id, cover_url, title, description, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setStacks(data || []);
      } catch (err) {
        console.error("Error fetching stacks:", err);
      } finally {
        setLoadingStacks(false);
      }
    };

    fetchStacks();
  }, [user?.id]);

  // Fetch friends list for modal
  const fetchFriendsList = async () => {
    if (!user?.id) return;
    setLoadingFriends(true);

    try {
      const { data: friendLinks, error: linkError } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id);

      if (linkError) throw linkError;
      if (!friendLinks || friendLinks.length === 0) {
        setFriendsList([]);
        return;
      }

<<<<<<< Updated upstream
      const friendIds = friendLinks.map((f) => f.friend_id);
=======
      const friendIds = friendLinks.map(row =>
        row.user_id === user.id ? row.friend_id : row.user_id
      ).filter(id => id !== user.id);

      if (friendIds.length === 0) {
        setFriendsList([]);
        return;
      }
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
                `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${f.pfp_url}`
=======
                `https://nonfraudulently-photoemissive-syreeta.ngrok-free.dev/api/upload/download-url/${f.pfp_url}`
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const handleSignOut = async () => {
    logout();
    router.replace("/signupProcess/signupPage" as RelativePathString);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 10 }}>
=======
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", paddingLeft: 0 }}>
>>>>>>> Stashed changes
        <Text style={styles.header}>Profile</Text>
      </View>

      {/* Profile Row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, paddingHorizontal: 20 }}>
        <Image
          source={pfpUrl ? { uri: pfpUrl } : require("../../assets/images/profile.png")}
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: IMAGE_SIZE / 2,
          }}
        />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 }}>
          <Text style={{ fontSize: 20, fontFamily: "Jacques Francois", color: "#333C42", fontWeight: "500" }}
            numberOfLines={1} ellipsizeMode="tail">
            {username}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Jacques Francois", color: "#333C42", textAlign: "center", }}
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
              fontFamily: "Luxurious Roman",
              marginBottom: 8,
            }}>
              {numFriends} Friends
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/profileSettings" as RelativePathString)}>
            <Feather name="settings" size={30} color="#333C42" />
          </Pressable>
        </View>
      </View>

      {/* Spotify Authorization Button */}
      <View style={{ width: "90%", alignItems: "center", marginTop: 15 }}>
        {spotifyToken ? (
          <Pressable
            onPress={disconnectSpotify}
            style={{
              backgroundColor: "#FF6B6B",
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
            <Feather name="x-circle" size={18} color="#FFF0E2" />
            <Text style={{ color: "#FFF0E2", fontFamily: "Jacques Francois", fontSize: 14 }}>
              Disconnect Spotify
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={authorizeSpotify}
            disabled={authorizingSpotify}
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
              opacity: authorizingSpotify ? 0.6 : 1,
            }}
          >
            {authorizingSpotify ? (
              <ActivityIndicator size="small" color="#FFF0E2" />
            ) : (
              <Feather name="music" size={18} color="#FFF0E2" />
            )}
            <Text style={{ color: "#FFF0E2", fontFamily: "Jacques Francois", fontSize: 14 }}>
              {authorizingSpotify ? "Connecting..." : "Connect Spotify"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8, width: "100%", justifyContent: "space-between", paddingHorizontal: 20 }}>
          <Pressable>
            <Feather name="plus-circle" size={28} color="#333C42" />
          </Pressable>
          <Text style={{ fontSize: 24, color: "#333C42", fontWeight: "500", fontFamily: "Jacques Francois" }}>
            {viewMode === "moments" ? "Moments" : "Stacks"}
          </Text>
          <Pressable onPress={() => setViewMode(prev => (prev === "moments" ? "stacks" : "moments"))}>
            <Feather name="filter" size={28} color="#333C42" />
          </Pressable>
        </View>

        {/* Main Feed */}
        <View style={{ flex: 1, width: "100%", paddingHorizontal: 15, paddingTop: 10 }}>
          <View style={{ display: viewMode === "moments" ? "flex" : "none", flex: 1 }}>
            {loadingMoments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#333C42" />
              </View>
            ) : moments.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>No moments yet 😢</Text>
              </View>
            ) : (
              <FlatList
                data={moments}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <View style={{ flex: 1, margin: 6, alignItems: "center" }}>
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
                      <Text style={{ fontFamily: "Jacques Francois", fontSize: 15, color: "#333C42" }} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={{ fontFamily: "Jacques Francois", fontSize: 13, color: "#555" }} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
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
                  <View style={styles.momentContainer}>
                    <Image
                      source={{ uri: item.cover_url }}
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
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </View>

      {/* Friends Modal */}
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
                        pathname: '/profile/[id]',
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
    </View>
  );
}

const POLAROID_WIDTH = 150;
const POLAROID_HEIGHT = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 75,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFF0E2",
  },
  header: {
    fontSize: 35,
    fontWeight: "600",
    color: "#333C42",
    fontFamily: "Luxurious Roman",
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
    width: POLAROID_WIDTH,
    height: POLAROID_HEIGHT,
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
    fontFamily: "Jacques Francois",
  },
  captionText: {
    color: "#333C42",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Jacques Francois",
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
    fontFamily: "Luxurious Roman",
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
    fontFamily: "Jacques Francois",
  },
  friendBio: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Jacques Francois",
  },
});