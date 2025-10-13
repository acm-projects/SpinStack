import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useRouter } from 'expo-router';

export default function SpotifyConnect() {
  const handleNext = () => {
    router.replace("../profile");
    /*this will fix but not yet (needs some more work)
    setTimeout(() => {
    router.dismissAll(); //dismiss all previous screens
  }, 100);*/
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
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
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
