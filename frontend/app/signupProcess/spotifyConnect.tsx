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
import {
  authenticateSpotify,
  hasSpotifyAuth,
  clearSpotifyTokens,
  getSpotifyUserId,
} from "../utils/spotifyAuth";
import { supabase } from "@/constants/supabase";

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
        const { data: userData, error } = await supabase
          .from("users")
          .select("spotify_user_id")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const hasSpotifyInDB = !!userData?.spotify_user_id;

        if (hasSpotifyInDB) {
          const hasValidToken = await hasSpotifyAuth();
          setIsConnected(hasValidToken);
        } else {
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

      if (token) {
        const spotifyUserId = await getSpotifyUserId(token);

        if (spotifyUserId && user?.id) {
          await supabase
            .from("users")
            .update({ spotify_user_id: spotifyUserId })
            .eq("id", user.id);
        }

        setIsConnected(true);
        Alert.alert("Success! 🎉", "Your Spotify account has been connected.");
      } else {
        Alert.alert(
          "Connection Failed",
          "Unable to connect to Spotify. Please try again."
        );
      }
    } catch (error) {
      console.error("Spotify connection error:", error);
      Alert.alert("Error", "An error occurred while connecting to Spotify.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
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

            if (user?.id) {
              await supabase
                .from("users")
                .update({ spotify_user_id: null })
                .eq("id", user.id);
            }

            setIsConnected(false);
            Alert.alert("Disconnected", "Your Spotify account has been disconnected.");
          },
        },
      ]
    );
  };

  const handleNext = () => {
    setProfileComplete(true);
    router.replace("/(tabs)/profile");
  };

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
      {/* Background */}
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

      {/* Back Button Animation */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
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
            </Animated.View>
          </Pressable>
        </View>
      </Animated.View>

      {/* Main Animated Content */}
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Connect to Spotify</Text>

          {/* Spotify Button Container */}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 260,
            }}
          >
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

              {/* Glow + Button */}
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

            {/* Connection Status */}
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

          {/* Next Button */}
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
