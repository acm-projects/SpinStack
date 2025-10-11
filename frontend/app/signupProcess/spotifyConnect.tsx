import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useRouter } from 'expo-router';
import { useAuth } from "@/_context/AuthContext";

export default function SpotifyConnect() {
  const { signingUp, setSigningUp } = useAuth();

  const handleNext = () => {
    setSigningUp(false);
    router.push("../profile");

  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect to Spotify</Text>

      <Pressable style={styles.Sbutton} onPress={() => { /* future functionality */ }}>
        <Text style={styles.SbuttonText}>Connect with Spotify</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "#000000ff",
    padding: 20
  },
  title: {
    color: "white",
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 400,
  },
  Sbutton: {
    backgroundColor: "#1DB954",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 50
  },
  SbuttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  button: {
    justifyContent: 'center',
    backgroundColor: '#272727',
    borderColor: '#0BFFE3',
    borderWidth: 2,
    borderRadius: 10,
    width: '90%',
    height: '8%',
  },
  buttonText: {
    color: '#ffffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
