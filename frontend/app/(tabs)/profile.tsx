import React from "react";
import { View, Text, Image, Button, StyleSheet, Pressable, Dimensions, Alert } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { supabase } from "@/constants/supabase";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from '@/_context/AuthContext';
import { router } from "expo-router";
export default function ProfileScreen() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  const numFriends = 7;
  const { setSession, setUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    setSession(null);
    setUser(null); // updates context
    router.replace('/signupProcess/signupPage' as RelativePathString); 
  };


  return (
    
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

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
          <Text style={{ fontSize: 20, color: "white", fontWeight: "500" }}>Haden Hicks</Text>
          <Text style={{ fontSize: 14, color: "white" }}>{"life is so short :("}</Text>
        </View>
        <View style={{ justifyContent: "center", paddingLeft: 30 }}>
          <Text
            style={{
              fontSize: 14,
              color: "white",
              textDecorationLine: "underline",
            }}
          >
            {numFriends} Friends
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/profileSettings" as RelativePathString)}
          style={{ transform: [{ translateY: -42 }, { translateX: 5 }] }}
        >
          <Feather name="settings" size={30} color="white" />
        </Pressable>
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
