import React, { useEffect, useState } from "react";
import { useAuth } from "@/_context/AuthContext";
import { supabase } from "@/constants/supabase";
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import * as Font from "expo-font";
import { useRouter } from "expo-router";

export default function ProfileSettings() {
  const { width } = Dimensions.get("window");
  // State for user info
  const [username, setUsername] = useState<string>("Loading...");
  const [bio, setBio] = useState<string>("");
  const { user, session, loading, pfpUrl, setPfpUrl } = useAuth();
  const IMAGE_SIZE = width * 0.2;
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

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

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={require("../assets/images/backBubble.png")}
            style={{ paddingTop: 5, marginRight: 47 }}
          />
        </Pressable>
        <Text style={styles.header}>Settings</Text>
      </View>

      {/* Profile Image + Info */}
      <View style={{ flexDirection: "row", marginTop: 15, paddingRight: 141 }}>
        <View style={{ position: "relative" }}>
          <Image
            source={require("../assets/images/profile.png")}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: IMAGE_SIZE / 2 }}
          />
          <Pressable
            style={styles.cameraButton}
            onPress={() => console.log("Change profile picture")}
          >
            <Feather name="camera" size={28} color="#FFF0E2" />
          </Pressable>
        </View>

        <View style={{ justifyContent: "center", paddingLeft: 18 }}>
          <Text style={styles.nameText}>Haden Hicks</Text>
          <Text style={styles.bioText}>{"life is so short :("}</Text>
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
    marginRight: 30
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    color: "#333C42",
    fontSize: 35,
    fontFamily: "Luxurious Roman",
    fontWeight: "600",
    alignItems: "center"
  },
  nameText: {
    fontSize: 20,
    fontFamily: "Jacques Francois",
    color: "#333C42",
    fontWeight: "500",
  },
  bioText: {
    fontSize: 14,
    fontFamily: "Jacques Francois",
    color: "#333C42",
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
