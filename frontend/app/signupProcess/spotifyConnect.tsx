import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { router, useRouter } from 'expo-router';
import { useAuth } from "@/_context/AuthContext";
import { authenticateSpotify, hasSpotifyAuth, clearSpotifyTokens, getSpotifyUserId } from '../utils/spotifyAuth';
import { supabase } from '@/constants/supabase';

import OpeningSplash from '../../assets/other/openingSplash.svg';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';

export default function SpotifyConnect() {
  const { user, setProfileComplete } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if this user has Spotify connected in database
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

  const handleConnectSpotify = async () => {
    try {
      setIsConnecting(true);
      const token = await authenticateSpotify();
      
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
        Alert.alert(
          "Success! 🎉",
          "Your Spotify account has been connected. You can now play moments!",
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
            
            // Remove Spotify user ID from database
            if (user?.id) {
              await supabase
                .from('users')
                .update({ spotify_user_id: null })
                .eq('id', user.id);
            }
            
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
            router.dismissAll();
            router.replace("/(tabs)/profile");
          }
        }
      ]
    );
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
        
        <Text style={styles.description}>
          Connect your Spotify account to play and share your favorite music moments with friends
        </Text>

        {isConnected ? (
          <View style={{ alignItems: 'center', gap: 20 }}>
            <View style={{ backgroundColor: '#8DD2CA', padding: 15, borderRadius: 10, borderWidth: 2, borderColor: '#333C42' }}>
              <Text style={{ fontFamily: 'Jacques Francois', fontSize: 16, color: '#333C42', textAlign: 'center' }}>
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

        <View style={styles.buttonContainer}>
          <Pressable onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {isConnected ? "Continue" : "Next"}
            </Text>
          </Pressable>

          {!isConnected && (
            <Pressable onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#333C42",
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: "Luxurious Roman"
  },
  description: {
    color: "#333C42",
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: "Jacques Francois",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  spotifyButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 30,
    minWidth: 250,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#333C42",
  },
  spotifyButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Jacques Francois"
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  nextButton: {
    backgroundColor: "#333c42",
    width: 352,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: "white",
    fontFamily: "Jacques Francois",
    fontSize: 16,
  },
  skipText: {
    color: "#39868F",
    fontFamily: "Jacques Francois",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});