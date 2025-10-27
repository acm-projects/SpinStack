import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { router, useRouter } from 'expo-router';
import { useAuth } from "@/_context/AuthContext";

import OpeningSplash from '../../assets/other/openingSplash.svg';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';

export default function SpotifyConnect() {
  const { user, setProfileComplete } = useAuth();

  const handleNext = () => {
    setProfileComplete(true);
    router.dismissAll();
    router.replace("../profile");
    /*this will fix but not yet (needs some more work)*/
    /*
    setTimeout(() => {
    router.dismissAll(); //dismiss all previous screens
  }, 100);*/
  };
  return (
    <View style = {[StyleSheet.absoluteFill, {flex: 1}]}>
      <View
        style={{
          flex: 1,
          position: 'absolute',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: "#FFF0E2",
        }}
      >
        <OpeningSplash width="100%" height="100%" style = {{marginTop: -30}}/>
      </View>
      <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
        <Pressable onPress={() => router.back()}>
          <View style = {{marginBottom: 60, marginLeft: 10}}>
              <View style = {{position: 'absolute', alignItems: 'center'}}>
                <Bubble width = {50} height = {50}/>
                <View style = {{marginTop: -40}}>
                  <Feather name="arrow-left" size={30} color="black"/>
                </View>
              </View>
            </View>

        </Pressable>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Connect to Spotify</Text>

        <Pressable style={styles.Sbutton} onPress={() => { /* future functionality */ }}>
          <Text style={styles.SbuttonText}>Connect with Spotify</Text>
        </Pressable>
        <Pressable onPress={handleNext}>
          <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontFamily: "Jacques Francois", textAlign: "center", fontSize: 16 }}>Next</Text>

          </View>
        </Pressable>
      </View>
    </View>
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
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Jacques Francois"
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
    fontFamily: "Jacques Francois"
  },
});
