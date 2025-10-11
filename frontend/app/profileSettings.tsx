import { useAuth } from "@/_context/AuthContext";
import { supabase } from "@/constants/supabase";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";
import Feather from "react-native-vector-icons/Feather";



export default function ProfileSettings() {
  const { width } = Dimensions.get("window");
  // State for user info
  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const { user, session, loading, pfpUrl, setPfpUrl } = useAuth();
  const IMAGE_SIZE = width * 0.2;


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
      } catch (err) {
        console.error("Unexpected error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [user?.id]);



  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <View style={{ flexDirection: "row", marginTop: 5, paddingRight: 130 }}>
        <View style={{ position: "relative" }}>
          <Image
            source={pfpUrl ? { uri: pfpUrl } : require("../assets/images/profile.png")}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: IMAGE_SIZE / 2 }}
          />
          <Pressable
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -25 }, { translateY: -25 }],
              backgroundColor: "#00000080",
              borderRadius: 20,
              padding: 5,
            }}
            onPress={() => console.log("Change profile picture")}
          >
            <Feather name="camera" size={40} color="white" />
          </Pressable>
        </View>

        <View style={{ flex: 2, paddingLeft: 18, justifyContent: "center" }}>
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
            numberOfLines={1}
            fontSize={25}
            style={{ color: "white", fontWeight: "500", width: "150%" }}
          >
            "{bio}"
          </AutoSizeText>
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          marginTop: 20,
          borderRadius: 10,
          padding: 10,
          width: "95%",
          height: "74%",
          backgroundColor: "#242424ff",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <Text style={styles.optionText}>Edit Profile Name</Text>
        <Text style={styles.optionText}>Edit Bio</Text>
        <Text style={styles.optionText}>Edit Username</Text>
        <Text style={styles.optionText}>Edit Email</Text>
        <Text style={styles.optionText}>Edit Password</Text>
      </View>

    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: "center", backgroundColor: "#000000ff" },
  text: {
    color: "white",
    fontSize: 35,
    fontFamily: "Intern",
    fontWeight: "600",
  },
  optionText: {
    fontSize: 20,
    color: "white",
    fontWeight: "300",
    textDecorationLine: "underline",
  },
});
