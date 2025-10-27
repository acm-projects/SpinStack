import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Text, View, Image, Easing, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useWindowDimensions } from 'react-native';
import Waveform from './waveform';
import MomentInfo from './momentInfo';
import LikeButton from './likeButton';
import Top from '@/assets/other/Group 7.svg';
import Upper from '@/assets/other/Group 5.svg';
import Lower from '@/assets/other/Group 8.svg';
import { RNSVGSvgIOS } from 'react-native-svg';
import * as SecureStore from 'expo-secure-store';

const API_BASE = "https://api.spotify.com/v1";

type Device = {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  is_restricted: boolean;
};

export default function MomentView({ data }: { data: MomentInfo }) {
  const { height, width } = useWindowDimensions();
  const vinylImg = require('../assets/images/vinyl.png');
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  const [token, setToken] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF0E2', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Jacques Francois', color: '#333C42' }}>
          No moment data available
        </Text>
      </View>
    );
  }

  // Vinyl spinning animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // Check Spotify auth and get token on mount
  useEffect(() => {
    const initSpotify = async () => {
      try {
        // Get stored token
        const storedToken = await SecureStore.getItemAsync('spotifyToken');
        
        if (!storedToken) {
          Alert.alert(
            "Spotify Not Connected",
            "Please connect your Spotify account in Settings to play moments.",
            [{ text: "OK" }]
          );
          setIsLoading(false);
          return;
        }

        console.log("âœ… Found Spotify token");
        setToken(storedToken);
        
        // Start playback after a short delay to ensure state is set
        setTimeout(() => {
          startPlayback(storedToken);
        }, 300);
        
      } catch (error) {
        console.error("Error initializing Spotify:", error);
        Alert.alert("Error", "Failed to initialize Spotify playback");
        setIsLoading(false);
      }
    };

    initSpotify();

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (token) {
        pausePlayback(token).catch(console.error);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const api = async (token: string, path: string, init?: RequestInit) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
    return res;
  };

  const getDevices = async (token: string): Promise<Device[]> => {
    const res = await api(token, "/me/player/devices");
    if (!res.ok) {
      console.error(`Failed to get devices: ${res.status}`);
      throw new Error(`devices: ${res.status}`);
    }
    const deviceData = await res.json();
    console.log("Available devices:", deviceData.devices);
    return deviceData.devices as Device[];
  };

  const transferPlayback = async (token: string, deviceId: string) => {
    console.log(`Transferring playback to device: ${deviceId}`);
    await api(token, "/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    });
  };

  const seekTo = async (token: string, ms: number) => {
    await api(token, `/me/player/seek?position_ms=${ms}`, { method: "PUT" });
  };

  const pausePlayback = async (token: string) => {
    try {
      await api(token, "/me/player/pause", { method: "PUT" });
      console.log("âœ… Playback paused");
    } catch (error) {
      console.error("Error pausing playback:", error);
    }
  };

  const startPlayback = async (spotifyToken: string) => {
    try {
      setIsLoading(true);
      const trackUri = `spotify:track:${data.moment.id}`;
      const startMs = Math.floor(data.moment.songStart * 1000);
      const endMs = Math.floor((data.moment.songStart + data.moment.songDuration) * 1000);

      console.log(`ðŸŽµ Starting playback for track: ${data.moment.title}`);
      console.log(`Track URI: ${trackUri}`);
      console.log(`Start: ${startMs}ms, End: ${endMs}ms`);

      // First, try to play on the active device
      let res = await api(spotifyToken, "/me/player/play", {
        method: "PUT",
        body: JSON.stringify({ 
          uris: [trackUri],
          position_ms: startMs
        }),
      });

      // Handle various device states
      if (res.status === 404 || res.status === 403 || res.status === 202) {
        console.log("âš ï¸ No active device, searching for available devices...");
        
        const devices = await getDevices(spotifyToken);
        
        if (devices.length === 0) {
          throw new Error("No Spotify devices found. Please open the Spotify app on your phone and start playing any song, then try again.");
        }

        // Find the best device to use
        const active = devices.find((d) => d.is_active && !d.is_restricted);
        const smartphone = devices.find((d) => d.type === "Smartphone" && !d.is_restricted);
        const anyAvailable = devices.find((d) => !d.is_restricted);
        
        const target = active ?? smartphone ?? anyAvailable;
        
        if (!target) {
          throw new Error("No available Spotify devices. Please make sure Spotify is installed and you're logged in.");
        }

        console.log(`ðŸ“± Using device: ${target.name} (${target.type})`);

        // Transfer playback to the target device
        await transferPlayback(spotifyToken, target.id);
        
        // Wait for transfer to complete
        await new Promise((r) => setTimeout(r, 800));
        
        // Try playing again on the specific device
        res = await api(
          spotifyToken,
          `/me/player/play?device_id=${encodeURIComponent(target.id)}`,
          {
            method: "PUT",
            body: JSON.stringify({ 
              uris: [trackUri],
              position_ms: startMs
            }),
          }
        );
      }

      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        console.error(`Play error ${res.status}: ${txt}`);
        throw new Error(`Failed to start playback (${res.status}). Make sure Spotify is open and playing on your device.`);
      }

      console.log("âœ… Playback started successfully");
      setIsPlaying(true);
      setIsLoading(false);

      // Start loop to keep playback within moment boundaries
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      pollingRef.current = setInterval(async () => {
        try {
          const playbackRes = await api(spotifyToken, "/me/player");
          
          if (playbackRes.status === 204) {
            // No active playback
            console.log("âš ï¸ No active playback detected");
            return;
          }
          
          if (!playbackRes.ok) return;
          
          const playbackData = await playbackRes.json();
          const pos = playbackData.progress_ms ?? 0;

          // Loop back to start if we've passed the end or are before start
          if (pos > endMs || pos < startMs) {
            console.log(`ðŸ”„ Looping back to start (was at ${pos}ms)`);
            await seekTo(spotifyToken, startMs);
          }
        } catch (error) {
          console.error("Error in playback loop:", error);
        }
      }, 500);

    } catch (error: any) {
      console.error("Playback error:", error);
      setIsLoading(false);
      
      let errorMessage = "Failed to start playback. ";
      
      if (error.message.includes("No Spotify devices")) {
        errorMessage += "Please open the Spotify app on your phone, start playing any song, then try again.";
      } else if (error.message.includes("No available Spotify devices")) {
        errorMessage += "Please make sure Spotify is installed and you're logged in.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }
      
      Alert.alert(
        "Playback Error",
        errorMessage,
        [{ text: "OK" }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF0E2', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#333C42" />
        <Text style={{ fontFamily: 'Jacques Francois', color: '#333C42', marginTop: 20 }}>
          Loading moment...
        </Text>
        <Text style={{ fontFamily: 'Jacques Francois', color: '#999', marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
          Make sure Spotify is open and playing
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF0E2' }}>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ height: '100%', alignItems: 'center', justifyContent: "flex-start" }}>
          <View style={{ width: '100%', height: 170 }}>
            <RNSVGSvgIOS><Top /></RNSVGSvgIOS>
          </View>
          <View style={{ marginLeft: 0, height: 298 }}>
            <RNSVGSvgIOS><Upper /></RNSVGSvgIOS>
          </View>
          <View style={{ marginLeft: 0, marginTop: -40, height: 298 }}>
            <RNSVGSvgIOS><Lower /></RNSVGSvgIOS>
          </View>
        </View>
      </View>

      <SafeAreaView style={[StyleSheet.absoluteFill]} edges={['top', 'left', 'right']}>
        <View style={{ justifyContent: 'flex-start' }}>
          <View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Image
              source={
                typeof data.user.profilePic === "string"
                  ? { uri: data.user.profilePic }
                  : data.user.profilePic
              }
              style={{ width: 40, height: 40, borderRadius: 50, overflow: 'hidden' }}
            />
            <View style={{ marginLeft: 10, marginRight: 40, flexDirection: 'row', flex: 1 }}>
              <View style={[{ width: '100%', justifyContent: "center" }]}>
                <View style={[{ width: '100%', height: 5, borderRadius: 50, backgroundColor: '#333c42', marginTop: 7 }]} />
                <View style={{ marginTop: 30 }}>
                  <Waveform
                    data={data.moment.waveform}
                    height={25}
                    start={data.moment.songStart / data.moment.length}
                    end={(data.moment.songStart + data.moment.songDuration) / (data.moment.length)}
                    baseColor="#333C42"
                    selectedColor="#87bd84"
                    anim={isPlaying}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.texxt, { fontFamily: 'Luxurious Roman' }]}>{data.moment.title}</Text>
            <Text style={[styles.texxt, { fontSize: 15, fontFamily: 'Jacques Francois' }]}>{data.moment.artist}</Text>
          </View>
        </View>

        <View style={{ flex: 0.87, alignContent: "center" }}>
          <View style={[{ flex: 1, justifyContent: "center", alignItems: "center" }]}>
            <Animated.View style={{ transform: [{ rotate: isPlaying ? spin : '0deg' }], position: 'relative', width: '100%' }}>
              <View style={[{ justifyContent: "center", alignItems: "center" }]}>
                <Image
                  source={
                    typeof data.moment.album === "string"
                      ? { uri: data.moment.album }
                      : data.moment.album
                  }
                  style={{ width: '40%', aspectRatio: 1, height: undefined }}
                />
                <Image
                  source={vinylImg}
                  style={{ width: '100%', aspectRatio: 1, height: undefined, position: "absolute" }}
                />
              </View>
            </Animated.View>
          </View>

          <View style={[{ flexDirection: 'row', alignItems: "center", justifyContent: "flex-end", marginBottom: 20, marginRight: 15 }]}>
            <LikeButton />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderColor: 'hsl(0,100%,100%)',
  },
  texxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333C42'
  }
});