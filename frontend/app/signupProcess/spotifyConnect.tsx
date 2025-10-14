import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { router, useRouter } from 'expo-router';
import * as Font from 'expo-font';
export default function SpotifyConnect() {
  const handleNext = () => {
    router.replace("../profile");

  };
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const loadFonts = async () => {
    await Font.loadAsync({
      'Luxurious Roman': require('@/fonts/LuxuriousRoman-Regular.ttf'),
      'Jacques Francois': require('@/fonts/JacquesFrancois-Regular.ttf'),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);
  return (
    <ImageBackground
      source={require("../../assets/images/signUpBackground.png")} //
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
        <Pressable onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/backBubble.png")}
            style={{

            }}
          />

        </Pressable>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Connect to Spotify</Text>

        <Pressable style={styles.Sbutton} onPress={() => { /* future functionality */ }}>
          <Text style={styles.SbuttonText}>Connect with Spotify</Text>
        </Pressable>
        <Pressable onPress={() => router.push("../profile")}>
          <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontFamily: "Jacques Francois", textAlign: "center", fontSize: 16 }}>Next</Text>

          </View>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    alignItems: "center",
    padding: 0,

  },
  title: {
    color: "#333C42",
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 458,
    fontFamily: "Luxurious Roman"
  },
  Sbutton: {
    backgroundColor: "#1DB954",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 30
  },
  SbuttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Jacues Francois"
  },
  button: {
    justifyContent: 'center',
    backgroundColor: '#333C42',
    borderRadius: 10,
    width: '90%',
    height: '8%',
  },
  buttonText: {
    color: "white",
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "Jacues Francois"
  },
});
