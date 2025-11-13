import { useAuth } from "@/_context/AuthContext";
import { supabase } from "@/constants/supabase";
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, Pressable, Dimensions, Animated, Alert, ActivityIndicator } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { RelativePathString, useRouter } from "expo-router";
import Bubble from '../assets/other/bubble.svg';
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';
import { authenticateSpotify, clearSpotifyTokens, getValidSpotifyToken } from "./utils/spotifyAuth";

export default function ProfileSettings() {
  const { width } = Dimensions.get("window");
  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const { user, pfpUrl, setPfpUrl, logout } = useAuth();
  const IMAGE_SIZE = width * 0.2;
  const router = useRouter();
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  
    
  // Animation setup
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleBackPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => router.back());
  };

  const handleSignOut = async () => {
    logout();
    router.dismissAll();
    console.log("dismissAll3");
    router.replace("/signupProcess/signupPage" as RelativePathString);
  };

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

        // Only fetch presigned URL if pfp_url exists and is not empty
        if (userData?.pfp_url && userData.pfp_url.trim() !== '') {
          try {
            const res = await fetch(`${nUrl}/${userData.pfp_url}`);
            if (res.ok) {
              const { downloadURL } = await res.json();
              setPfpUrl(downloadURL);
            } else {
              console.error("Failed to fetch presigned URL:", res.status);
              // If fetch fails, set to null so default image is used
              setPfpUrl(null);
            }
          } catch (err) {
            console.error("Error fetching presigned URL:", err);
            // If error occurs, set to null so default image is used
            setPfpUrl(null);
          }
        } else {
          // No profile picture set, use default
          setPfpUrl(null);
        }
      } catch (err) {
        console.error("Unexpected error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [user?.id]);

  
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
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={[styles.headerRow]}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={{ marginLeft: 10, width: 60, height: 60 }}>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Bubble width={50} height={50} />
                <View style={{ marginTop: -40 }}>
                  <Feather name="arrow-left" size={30} color="black" />
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
        <Text style={[styles.header, { marginBottom: 10 }]}>Settings</Text>
      </View>

      {/* Profile Image + Info */}
      <View style={{ flexDirection: "row", paddingLeft: 15, alignSelf: "flex-start" }}>
        <View style={{ position: "relative" }}>
          <Image
            source={pfpUrl ? { uri: pfpUrl } : require("../assets/images/profile.png")}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: IMAGE_SIZE / 2 }}
          />
          <Pressable
            style={styles.cameraButton}
            onPress={() => console.log("Change profile picture")}
          >
            <Feather name="camera" size={28} color="#FFF0E2" />
          </Pressable>
        </View>

        <View style={{ flexDirection: "column", paddingLeft: 18, justifyContent: "center" }}>
          <Text style={{ color: "#333C42", fontWeight: "500", fontSize: 20, fontFamily: "Lato" }}>
            {username}
          </Text>
          <Text style={{ color: "#333C42", fontWeight: "500", width: "150%", fontSize: 14, fontFamily: "Lato" }}>
            Bio: {bio}
          </Text>
        </View>
      </View>

      {/* Settings List */}
      <View style={styles.contentBox}>
        <Text style={styles.optionText}>Edit Profile Name</Text>
        <Text style={styles.optionText}>Edit Bio</Text>
        <Text style={styles.optionText}>Edit Username</Text>
        <Text style={styles.optionText}>Edit Email</Text>
        <Text style={styles.optionText}>Edit Password</Text>
        <Text style={styles.optionText} onPress={handleSignOut}>Sign Out</Text>
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
                      marginLeft: 35,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 75,
    alignItems: "center",
    backgroundColor: "#FFF0E2",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "90%",
    marginRight: 128,
    justifyContent: "center",
  },
  backButton: {
    paddingRight: 60,
  },
  header: {
    color: "#333C42",
    fontSize: 35,
    fontFamily: "Lato",
    fontWeight: "700",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#8DD2CA",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "#333C42",
  },
  contentBox: {
    flexDirection: "column",
    marginTop: 25,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: "94%",
    height: "70%",
    backgroundColor: "#8DD2CA",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  optionText: {
    fontSize: 18,
    color: "#333C42",
    fontFamily: "Lato",
    textDecorationLine: "underline",
    marginBottom: 12,
  },
});
