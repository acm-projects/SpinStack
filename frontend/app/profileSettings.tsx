import React from "react";
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";

export default function ProfileSettings() {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;
  return (
    <View style={styles.container}>
    <Text style={styles.text}>Settings</Text>
   <View style={{ flexDirection: "row", marginTop: 5, paddingRight: 130 }}>
  <View style={{ position: "relative" }}> 
    <Image
      source={require("../assets/images/profile.png")}
      style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: IMAGE_SIZE / 2 }}
    />
    <Pressable
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -25 }, { translateY: -25 }], // half of icon size
        backgroundColor: "#00000080", // optional: semi-transparent circle
        borderRadius: 20,
        padding: 5,
      }}
      onPress={() => console.log("Change profile picture")}
    >
      <Feather name="camera" size={40} color="white" />
    </Pressable>
  </View>

  <View style={{ justifyContent: "center", paddingLeft: 18 }}>
    <Text style={{ fontSize: 20, color: "white", fontWeight: "500" }}>Haden Hicks</Text>
    <Text style={{ fontSize: 14, color: "white" }}>{"life is so short :("}</Text>
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
          justifyContent: "flex-start", // push items to top
          alignItems: "flex-start",      // align left
          gap: 10,                       // optional: space between items (RN 0.71+)
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
