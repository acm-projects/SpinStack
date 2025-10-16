import React, { useState, useEffect } from "react";
import { View, Text, Image, Button, StyleSheet, Pressable, Dimensions, FlatList } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { RelativePathString, useRouter } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/_context/AuthContext";
import * as Font from "expo-font";

export default function ProfileScreen() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  const { user, session, loading, pfpUrl, setPfpUrl } = useAuth();
  const router = useRouter();
  const { logout } = useAuth();

  // State for user info
  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const [numFriends, setNumFriends] = useState<number>(0);


  useEffect(() => {
    if (!user?.id) return;

    const fetchUserInfo = async () => {
      try {
        // Fetch user info from Supabase
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

        // Fetch presigned URL if user has a profile image
        if (userData?.pfp_url) {
          try {
            const res = await fetch(
              `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${userData.pfp_url}`
            );
            if (res.ok) {
              const { downloadURL } = await res.json();
              setPfpUrl(downloadURL); // Set global pfpUrl
            } else {
              console.error("Failed to fetch presigned URL:", res.status);
            }
          } catch (err) {
            console.error("Error fetching presigned URL:", err);
          }
        }

        // Fetch number of friends
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
  const [fontsLoaded, setFontsLoaded] = useState(false);

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

  const handleSignOut = async () => {
    logout();
    router.replace('/signupProcess/signupPage' as RelativePathString);
  };

  const polaroids = [
    require("../../assets/images/polaroidFrame.png"),
    require("../../assets/images/polaroidFrame.png"),
    require("../../assets/images/polaroidFrame.png"),
    require("../../assets/images/polaroidFrame.png"),
    require("../../assets/images/polaroidFrame.png"),
    require("../../assets/images/polaroidFrame.png"),
  ];

  return (

    <View style={styles.container}>
      
  

        {/* Centered title */}
        <Text style={[styles.header, { textAlign: "center" }]}>Profile</Text>

      {/* --- Profile Header --- */}
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <Image
          source={pfpUrl ? { uri: pfpUrl } : require("../../assets/images/profile.png")} style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: IMAGE_SIZE / 2,
          }}
        />
        <View style={{ justifyContent: "center", paddingLeft: 18 }}>
          <Text style={{ fontSize: 20, fontFamily: "Jacques Francois", color: "#333C42", fontWeight: "500" }}>
            Haden Hicks
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Jacques Francois", color: "#333C42" }}>
            {"life is so short :("}
          </Text>
        </View>

        {/* Friends count */}
        <View style={{ justifyContent: "center", paddingHorizontal: 10 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#333C42",
              textDecorationLine: "underline",
              fontFamily: "Luxurious Roman",
            }}
            numberOfLines={1}
          >
            {numFriends} Friends
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/profileSettings" as RelativePathString)}
          style={{ transform: [{ translateY: -42 }, { translateX: 5 }] }}
        >
          <Feather name="settings" size={30} color="#333C42" />
        </Pressable>
      </View>

      {/* --- Content --- */}
      <View style={styles.content}>
        {/* Header Row */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8 }}>
          <Pressable>
            <Feather style={{ paddingRight: 107 }} name="plus-circle" size={28} color="#333C42" />
          </Pressable>
          <Text style={{ fontSize: 24, color: "#333C42", fontWeight: "500", fontFamily: "Jacques Francois" }}>
            Stacks
          </Text>
          <Pressable>
            <Feather style={{ paddingLeft: 107 }} name="filter" size={28} color="#333C42" />
          </Pressable>
        </View>

        {/* --- Scrollable Polaroid Grid --- */}
        <View style={{ flex: 1, width: "100%", paddingHorizontal: 10, paddingTop: 10 }}>
          <FlatList
            data={polaroids}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingVertical: 0 }}
            renderItem={({ item }) => (
              <View style={styles.polaroidContainer}>
                <Image source={item} style={styles.polaroidImage} />
              </View>
            )}
          />
        </View>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    alignItems: "center"
  },
  polaroidContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  polaroidImage: {
    width: 150,
    height: 180,
    resizeMode: "contain",
  },
});
