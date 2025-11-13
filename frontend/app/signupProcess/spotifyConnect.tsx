import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/_context/AuthContext";
import { authenticateSpotify, hasSpotifyAuth, clearSpotifyTokens, getSpotifyUserId } from '../utils/spotifyAuth';
import { supabase } from '@/constants/supabase';

import OpeningSplash from "../../assets/other/openingSplash.svg";
import Bubble from "../../assets/other/bubble.svg";
import Feather from "@expo/vector-icons/Feather";

export default function SpotifyConnect() {
  const { setProfileComplete } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const backScaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const rippleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;
  const nextPulseAnim = useRef(new Animated.Value(1)).current;

  const { user } = useAuth();

  useEffect(() => {

    
    const checkConnection = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has spotify_user_id in database
        const { data: userData, error } = await supabase
          .from('users')
          .select('spotify_user_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const hasSpotifyInDB = !!userData?.spotify_user_id;
        
        // If they have Spotify in DB, check if token is still valid
        if (hasSpotifyInDB) {
          const hasValidToken = await hasSpotifyAuth();
          setIsConnected(hasValidToken);
        } else {
          // New user or no Spotify connection - clear any old tokens
          await clearSpotifyTokens();
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Error checking Spotify connection:", error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, [user?.id]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.08,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(nextPulseAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(nextPulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const handleBackPress = () => {
    Animated.sequence([
      Animated.timing(backScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(backScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => router.back());
  };

  const handleConnectSpotify = async () => {
    try {
      setIsConnecting(true);
      const token = await authenticateSpotify();
<<<<<<< HEAD

=======
>>>>>>> main
      if (token) {
        // Get Spotify user ID and save to database
        const spotifyUserId = await getSpotifyUserId(token);
        
        if (spotifyUserId && user?.id) {
          // Save Spotify user ID to database
          const { error } = await supabase
            .from('users')
            .update({ spotify_user_id: spotifyUserId })
            .eq('id', user.id);

          if (error) {
            console.error("Error saving Spotify user ID:", error);
          }
        }

        setIsConnected(true);
        Alert.alert("Success! 🎉", "Your Spotify account has been connected.", [
          { text: "OK" },
        ]);
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
    Alert.alert("Disconnect Spotify?", "You'll need to reconnect to play moments.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          await clearSpotifyTokens();
            
            // Remove Spotify user ID from database
            if (user?.id) {
              await supabase
                .from('users')
                .update({ spotify_user_id: null })
                .eq('id', user.id);
            }
            
          setIsConnected(false);
          Alert.alert("Disconnected", "Your Spotify account has been disconnected.");
        },
      },
    ]);
  };

  const handleNext = () => {
    setProfileComplete(true);
    // Use replace with the full path to avoid navigation stack issues
    router.replace("/(tabs)/profile");
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Spotify Connection?",
      "You won't be able to play moments until you connect Spotify later in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => {
            setProfileComplete(true);
            // Use replace with the full path to avoid navigation stack issues
            router.replace("/(tabs)/profile");
          }
        }
      ]
    );
  };

<<<<<<< HEAD
  const handleNext = () => {
    setProfileComplete(true);
    router.dismissAll();
    console.log("dismissAll4");
    router.replace("../profile");
  };

=======
>>>>>>> main
  if (isLoading) {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            flex: 1,
            backgroundColor: "#FFF0E2",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#333C42" />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      <View
        style={{
          flex: 1,
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "#FFF0E2",
        }}
      >
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>

      <Animated.View
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
          <Pressable onPress={handleBackPress}>
            <Animated.View style={{ transform: [{ scale: backScaleAnim }] }}>
              <View style={{ marginBottom: 60, marginLeft: 10 }}>
                <View style={{ position: "absolute", alignItems: "center" }}>
                  <Bubble width={50} height={50} />
                  <View style={{ marginTop: -40 }}>
                    <Feather name="arrow-left" size={30} color="black" />
                  </View>
                </View>
              </View>
<<<<<<< HEAD
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
=======
            </Animated.View>
>>>>>>> main
          </Pressable>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Connect to Spotify</Text>

          {/* --- FIXED: Spotify button centered independent of text --- */}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 260,
            }}
          >
            {/* Button and ripple stacked absolutely */}
            <View
              style={{
                width: 130,
                height: 130,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Ripple */}
              <Animated.View
                style={{
                  position: "absolute",
                  width: 130,
                  height: 130,
                  borderRadius: 65,
                  backgroundColor: "#1DB954",
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                }}
              />

              {/* Glow + image */}
              <Animated.View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  transform: [{ scale: glowAnim }],
                  shadowColor: "#1DB954",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.7,
                  shadowRadius: 18,
                  elevation: 12,
                }}
              >
                <Pressable
                  onPress={isConnected ? handleDisconnect : handleConnectSpotify}
                  disabled={isConnecting}
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 65,
                    backgroundColor: "#1DB954",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <Animated.Image
                    source={require("@/assets/images/spotify.png")}
                    style={{
                      width: 130,
                      height: 130,
                      resizeMode: "contain",
                      opacity: isConnecting ? 0.5 : 1,
                      transform: [{ scale: isConnecting ? 0.95 : 1 }],
                    }}
                  />
                </Pressable>
              </Animated.View>
            </View>

            {/* Status text BELOW the ripple container */}
            <Text
              style={{
                marginTop: 16,
                color: "#333C42",
                fontFamily: "Lato",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {isConnected
                ? "✓ Connected"
                : isConnecting
                ? "Connecting..."
                : "Tap to Connect"}
            </Text>
          </View>
          {/* --- END FIX --- */}

          {/* Next button */}
          <Pressable onPress={handleNext}>
            <Animated.View style={{ transform: [{ scale: nextPulseAnim }] }}>
              <View
                style={{
                  backgroundColor: "#333c42",
                  width: 352,
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Lato",
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  Next
                </Text>
              </View>
            </Animated.View>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, alignItems: "center", padding: 0 },
  title: {
    color: "#333C42",
    fontSize: 35,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 170,
    fontFamily: "Lato",
  },
});
