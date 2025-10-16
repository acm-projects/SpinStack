import React, { useState, useEffect } from "react";
import { View, Text, Image, Button, StyleSheet, Pressable, Dimensions, FlatList } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from "@/_context/AuthContext";
import * as Font from "expo-font";

export default function ProfileScreen() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  const numFriends = 7;
  const { setSession, setUser } = useAuth();
  const router = useRouter();
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
    setSession(null);
    setUser(null);
    router.replace("/signupProcess/signupPage" as RelativePathString);
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
      <Text style={styles.header}>Profile</Text>

      {/* --- Profile Header --- */}
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <Image
          source={require("../../assets/images/profile.png")}
          style={{
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
        <View style={{ justifyContent: "center", paddingLeft: 30 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#333C42",
              textDecorationLine: "underline",
              fontFamily: "Luxurious Roman",
            }}
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
