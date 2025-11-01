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
import { hasSpotifyAuth, authenticateSpotify } from "../utils/spotifyAuth";
import { useMomentInfoStore } from "../stores/useMomentInfoStore";
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';
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

  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  const POLAROID_WIDTH = 150;
  const POLAROID_HEIGHT = 200;
  const POLAROID_URL = require("../../assets/images/polaroidFrame.webp");
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  // Extract track ID from Spotify URL
  const extractTrackId = (songUrl: string): string | null => {
    if (!songUrl) return null;
    const match = songUrl.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Check Spotify connection status
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('spotifyToken');
        setSpotifyConnected(!!storedToken);
      } catch (error) {
        console.error("Error checking Spotify connection:", error);
      }
    };
    checkSpotifyConnection();
  }, []);

  // Disconnect Spotify
  const handleDisconnectSpotify = async () => {
    try {
      await SecureStore.deleteItemAsync('spotifyToken');
      setSpotifyConnected(false);
      Alert.alert("Disconnected", "Spotify has been disconnected");
    } catch (err) {
      console.error("Error disconnecting Spotify:", err);
      Alert.alert("Error", "Failed to disconnect Spotify");
    }
  };
  const handleConnectSpotify = async () => {
    try {
      setIsConnectingSpotify(true);
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

      // Store token
      await SecureStore.setItemAsync('spotifyToken', session.accessToken);
      setSpotifyConnected(true);

      Alert.alert(
        "Success! 🎉",
        "Your Spotify account has been connected.",
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
              // Don't set pfpUrl if it fails, will use default
            }
          } catch (err) {
            console.error("Error fetching presigned URL:", err);
            // Don't set pfpUrl if it fails, will use default
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
    const token = await SecureStore.getItemAsync('spotifyToken');

    if (trackId && token) {
      const length = await getSpotifyTrackLength(trackId, token);
      if (length) moment.length = length;
    }


    setSelectedMomentInfo({
      moment: {
        id: trackId || moment.id,
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
      }
    });




    if (true) {
      console.log("Replacing existing /stack screen");
      router.replace('/stack' as RelativePathString);
    } else {
      console.log("Pushing new /stack screen");
      //router.push('/stack' as RelativePathString);
    }

  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", paddingLeft: 120 }}>
        <Text style={styles.header}>Profile</Text>
      <View style = {{ alignSelf: "center", marginLeft: 90 }}>
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
            <Text style={{ color: "#FFF0E2", fontFamily: "Lato", fontSize: 14 }}>
              Spotify Connected (Tap to Disconnect)
            </Text>
          </Pressable>
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
          <Pressable>
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
});