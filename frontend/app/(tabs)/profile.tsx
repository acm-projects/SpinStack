import React, { useEffect, useState } from "react";
import { View, Text, Image, Button, StyleSheet, Pressable, Dimensions, Alert } from "react-native";
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import Feather from "react-native-vector-icons/Feather";
import { supabase } from "@/constants/supabase";
import { RelativePathString, useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth } from '@/_context/AuthContext';
import { router } from "expo-router";



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

  const handleSignOut = async () => {
    logout();
    router.replace('/signupProcess/signupPage' as RelativePathString);
  };



  return (

    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 10 }}>
        {/* Empty view to balance spacing on the left */}
        <View style={{ width: 30 }} />

        {/* Centered title */}
        <Text style={[styles.header, { textAlign: "center", flex: 1 }]}>Profile</Text>

        {/* Settings icon on the right */}
        <Pressable onPress={() => router.push("/profileSettings" as RelativePathString)}>
          <Feather name="settings" size={30} color="white" />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, paddingLeft: 5 }}>
        {/* Profile Image */}
        <Image
          source={pfpUrl ? { uri: pfpUrl } : require("../../assets/images/profile.png")} style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: IMAGE_SIZE / 2,
          }}
        />

        {/* Username + Bio */}
        <View style={{ flex: 1, paddingLeft: 18, justifyContent: "center" }}>
          <AutoSizeText
            mode={ResizeTextMode.max_lines}
            numberOfLines={1}
            fontSize={18}
            style={{ color: "white", fontWeight: "500" }}
          >
            {username}
          </AutoSizeText>

          <AutoSizeText
            mode={ResizeTextMode.max_lines}
            numberOfLines={2}
            fontSize={12}
            style={{ color: "white", flexWrap: "wrap" }}
          >
            "{bio}"
          </AutoSizeText>
        </View>

        {/* Friends count */}
        <View style={{ justifyContent: "center", paddingHorizontal: 10 }}>
          <Text
            style={{
              fontSize: 14,
              color: "white",
              textDecorationLine: "underline",
            }}
            numberOfLines={1}
          >
            {numFriends} Friends
          </Text>
        </View>

      </View>

      <View style={styles.content}>
        <Text style={{ fontSize: 20, color: "white", fontWeight: "500" }}>Stacks</Text>
        {/*  Sign Out Button */}
        <Button title="Sign Out" onPress={handleSignOut} color="#0BFFE3" />
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
  },
  header: { fontSize: 35, fontWeight: "600", color: "white" },
  content: {
    flexDirection: "column",
    marginTop: 20,
    borderRadius: 10,
    padding: 0,
    width: "97%",
    height: "78%",
    backgroundColor: "#242424ff",
    justifyContent: "center",
    alignItems: "center",
  },
});
