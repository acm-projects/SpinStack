import { useAuth } from "@/_context/AuthContext";
import { supabase } from "@/constants/supabase";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import Bubble from '../assets/other/bubble.svg';
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text'; // import these

export default function ProfileSettings() {
  const { width } = Dimensions.get("window");
  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const { user, pfpUrl, setPfpUrl } = useAuth();
  const IMAGE_SIZE = width * 0.2;
  const router = useRouter();

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
      } catch (err) {
        console.error("Unexpected error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={[styles.headerRow]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <View style={{ marginLeft: 10, width: 60, height: 60 }}>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Bubble width={50} height={50} />
              <View style={{ marginTop: -40 }}>
                <Feather name="arrow-left" size={30} color="black" />
              </View>
            </View>
          </View>
        </Pressable>
        <Text style={[styles.header, { marginBottom: 10 }]}>Settings</Text>
      </View>

      {/* Profile Image + Info */}
      <View style={{ flexDirection: "row", paddingRight: 141 }}>
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

        <View style={{ flex: 2, paddingLeft: 18, justifyContent: "center" }}>
          <AutoSizeText
            mode={ResizeTextMode.max_lines}
            numberOfLines={1}
            style={{ color: "white", fontWeight: "500", fontSize: 18 }}
          >
            {username}
          </AutoSizeText>
          <AutoSizeText
            mode={ResizeTextMode.max_lines}
            numberOfLines={1}
            style={{ color: "white", fontWeight: "500", width: "150%", fontSize: 25 }}
          >
            "{bio}"
          </AutoSizeText>
        </View>
      </View>

      {/* Settings List */}
      <View style={styles.contentBox}>
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
    marginRight: 30,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    color: "#333C42",
    fontSize: 35,
    fontFamily: "Luxurious Roman",
    fontWeight: "600",
    alignItems: "center",
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
    fontFamily: "Jacques Francois",
    textDecorationLine: "underline",
    marginBottom: 12,
  },
});