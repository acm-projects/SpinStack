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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { RelativePathString, useRouter } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/_context/AuthContext";
import * as Font from "expo-font";

export default function ProfileScreen() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  const { user, pfpUrl, setPfpUrl, logout } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const [numFriends, setNumFriends] = useState<number>(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [moments, setMoments] = useState<any[]>([]);
  const [loadingMoments, setLoadingMoments] = useState(true);

  const POLAROID_WIDTH = 150;
  const POLAROID_HEIGHT = 200;

  // Load fonts
  const loadFonts = async () => {
    await Font.loadAsync({
      "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
      "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

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
              `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${userData.pfp_url}`
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

        // Count friends
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

  const handleSignOut = async () => {
    logout();
    router.replace("/signupProcess/signupPage" as RelativePathString);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 10 }}>
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
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Jacques Francois",
              color: "#333C42",
              fontWeight: "500",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {username}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Jacques Francois",
              color: "#333C42",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            "{bio || 'life is so short :('}"
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 14,
              color: "#333C42",
              textDecorationLine: "underline",
              fontFamily: "Luxurious Roman",
              marginBottom: 8,
            }}
          >
            {numFriends} Friends
          </Text>
          <Pressable onPress={() => router.push("/profileSettings" as RelativePathString)}>
            <Feather name="settings" size={30} color="#333C42" />
          </Pressable>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 8,
            width: "100%",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          <Pressable>
            <Feather name="plus-circle" size={28} color="#333C42" />
          </Pressable>
          <Text style={{ fontSize: 24, color: "#333C42", fontWeight: "500", fontFamily: "Jacques Francois" }}>
            Moments
          </Text>
          <Pressable>
            <Feather name="filter" size={28} color="#333C42" />
          </Pressable>
        </View>

        <View style={{ flex: 1, width: "100%", paddingHorizontal: 20, paddingTop: 10 }}>
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
              renderItem={({ item }) => (
                <View style={styles.momentContainer}>
                  {/* Cover Image */}
                  <Image
                    source={{ uri: item.cover_url }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />

                  {/* Polaroid Frame */}
                  <Image
                    source={require("../../assets/images/polaroidFrame.png")}
                    style={styles.polaroid}
                  />

                  {/* Text on top of both cover and polaroid, at the bottom */}
                  <View style={[styles.textOnTop, { bottom: 10 }]}>
                    <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
                      {item.title}
                    </Text>
                    <Text style={styles.captionText} numberOfLines={1} ellipsizeMode="tail">
                      {item.description}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
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
  polaroid: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    resizeMode: "contain",
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
    fontFamily: "LuxuriousRoman",
    fontWeight: "light"
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
