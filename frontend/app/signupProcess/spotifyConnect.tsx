import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { router, useRouter } from 'expo-router';
import { useAuth } from "@/_context/AuthContext";
import { authenticateSpotify, hasSpotifyAuth, clearSpotifyTokens } from '../utils/spotifyAuth';

import OpeningSplash from '../../assets/other/openingSplash.svg';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';

export default function SpotifyConnect() {
  const { user, setProfileComplete } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await hasSpotifyAuth();
        setIsConnected(connected);
      } catch (error) {
        console.error("Error checking Spotify connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  const handleConnectSpotify = async () => {
    try {
      setIsConnecting(true);
      const token = await authenticateSpotify();

      if (token) {
        setIsConnected(true);
        Alert.alert(
          "Success! 🎉",
          "Your Spotify account has been connected.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Connection Failed",
          "Unable to connect to Spotify. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Spotify connection error:", error);
      Alert.alert(
        "Error",
        "An error occurred while connecting to Spotify.",
        [{ text: "OK" }]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      "Disconnect Spotify?",
      "You'll need to reconnect to play moments.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await clearSpotifyTokens();
            setIsConnected(false);
            Alert.alert("Disconnected", "Your Spotify account has been disconnected.");
          }
        }
      ]
    );
  };

  const handleNext = () => {
    setProfileComplete(true);
    router.dismissAll();
    console.log("dismissAll4");
    router.replace("../profile");
  };

  if (isLoading) {
    return (
      <View style={[StyleSheet.absoluteFill, { flex: 1, backgroundColor: '#FFF0E2', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#333C42" />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
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
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>

      <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
        <Pressable onPress={() => router.back()}>
          <View style={{ marginBottom: 60, marginLeft: 10 }}>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Bubble width={50} height={50} />
              <View style={{ marginTop: -40 }}>
                <Feather name="arrow-left" size={30} color="black" />
              </View>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Connect to Spotify</Text>

        {isConnected ? (
          <View style={{ alignItems: 'center', gap: 20 }}>
            <View style={{ backgroundColor: '#8DD2CA', padding: 15, borderRadius: 10, borderWidth: 2, borderColor: '#333C42' }}>
              <Text style={{ fontFamily: 'Lato', fontSize: 16, color: '#333C42', textAlign: 'center' }}>
                ✓ Spotify Connected
              </Text>
            </View>

            <Pressable
              style={[styles.spotifyButton, { backgroundColor: '#FF6B6B' }]}
              onPress={handleDisconnect}
            >
              <Text style={[styles.spotifyButtonText, { color: 'white' }]}>
                Disconnect
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.spotifyButton}
            onPress={handleConnectSpotify}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.spotifyButtonText}>
                Connect with Spotify
              </Text>
            )}
          </Pressable>
        )}

        <Pressable onPress={handleNext}>
          <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontFamily: "Lato", textAlign: "center", fontSize: 16 }}>
              Next
            </Text>
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
    fontFamily: "Lato"
  },
  spotifyButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 30,
    minWidth: 250,
    alignItems: 'center',
  },
  spotifyButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Lato"
  },
});