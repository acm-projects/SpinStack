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
import { useFocusEffect } from '@react-navigation/native';
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
  
  // Track current moment to detect changes - use a unique key
  const currentMomentKey = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);
  const cleanupExecutedRef = useRef(false);

  // Generate unique key for moment (includes start time to differentiate same songs)
  const getMomentKey = (momentData: typeof data.moment) => {
    return `${momentData.id}_${momentData.songStart}_${momentData.songDuration}`;
  };

  // Vinyl animation loop
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isPlaying) {
      loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    } else {
      spinAnim.stopAnimation();
    }

    return () => {
      loop?.stop?.();
    };
  }, [isPlaying]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  useEffect(() => {
    spinAnim.setValue(0);
  }, [data.moment.id]);


  // Initialize token on mount
  useEffect(() => {
    const initSpotify = async () => {
      try {
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

        console.log("✅ Found Spotify token");
        setToken(storedToken);
      } catch (error) {
        console.error("Error initializing Spotify:", error);
        Alert.alert("Error", "Failed to initialize Spotify playback");
        setIsLoading(false);
      }
    };

    initSpotify();

    // Cleanup on unmount
    return () => {
      console.log("🗑️ Component unmounting - final cleanup");
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      spinAnim.stopAnimation();
    };
  }, []);

  // Cleanup function to stop playback
  const cleanup = React.useCallback(async (cleanupToken: string | null) => {
    if (cleanupExecutedRef.current) {
      console.log("🔄 Cleanup already executed, skipping");
      return;
    }
    
    console.log("🛑 Executing cleanup");
    cleanupExecutedRef.current = true;
    isActiveRef.current = false;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (cleanupToken) {
      await pausePlayback(cleanupToken).catch(console.error);
    }

    spinAnim.stopAnimation();
    setIsPlaying(false);
  }, []);

  // Detect moment changes and cleanup immediately
  useEffect(() => {
    if (!data?.moment?.id) return;

    const newMomentKey = getMomentKey(data.moment);
    const momentChanged = currentMomentKey.current !== null && currentMomentKey.current !== newMomentKey;
    
    if (momentChanged) {
      console.log(`🔄 Moment changed from ${currentMomentKey.current} to ${newMomentKey}`);
      console.log(`   Title: ${data.moment.title}, Start: ${data.moment.songStart}, Duration: ${data.moment.songDuration}`);
      
      // IMMEDIATELY stop playback and clear intervals
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      setIsPlaying(false);
      setIsLoading(true);
      spinAnim.stopAnimation();
      
      // Pause playback asynchronously
      if (token) {
        pausePlayback(token).catch(console.error);
      }
      
      // Reset flags for new moment
      cleanupExecutedRef.current = false;
      isActiveRef.current = false;
    }
    
    // Update current moment key
    currentMomentKey.current = newMomentKey;
  }, [data?.moment?.id, data?.moment?.songStart, data?.moment?.songDuration, token]);

  // Handle focus/unfocus with proper cleanup
  useFocusEffect(
    React.useCallback(() => {
      const momentKey = data?.moment ? getMomentKey(data.moment) : null;
      console.log("🎧 MomentView focused for:", data?.moment?.title, "Key:", momentKey);
      isActiveRef.current = true;
      
      // Only reset cleanup flag if this is truly a new focus (not just re-render)
      if (cleanupExecutedRef.current) {
        cleanupExecutedRef.current = false;
      }

      let startTimeout: NodeJS.Timeout | null = null;

      if (token && data?.moment?.id) {
        // Wait longer for cleanup and devices to be ready
        startTimeout = setTimeout(async () => {
          if (isActiveRef.current && !cleanupExecutedRef.current) {
            console.log("🎯 Starting playback after delay for:", data.moment.title);
            console.log("   Start time:", data.moment.songStart, "Duration:", data.moment.songDuration);
            await startPlayback(token);
          }
        }, 800);
      } else {
        setIsLoading(false);
      }

      return () => {
        console.log("🛑 MomentView unfocused from:", data?.moment?.title);
        
        if (startTimeout) {
          clearTimeout(startTimeout);
        }

        // CRITICAL: Actually call cleanup when losing focus
        cleanup(token);
      };
    }, [token, data?.moment?.id, data?.moment?.songStart, data?.moment?.songDuration, data?.moment?.title, cleanup])
  );

  // --- Spotify API helpers ---
  const api = async (spotifyToken: string, path: string, init?: RequestInit) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${spotifyToken}`,
        ...(init?.headers || {}),
      },
    });
    return res;
  };

  const getDevices = async (spotifyToken: string): Promise<Device[]> => {
    const res = await api(spotifyToken, "/me/player/devices");
    if (!res.ok) throw new Error(`devices: ${res.status}`);
    const deviceData = await res.json();
    return deviceData.devices as Device[];
  };

  const transferPlayback = async (spotifyToken: string, deviceId: string) => {
    await api(spotifyToken, "/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    });
  };

  const seekTo = async (spotifyToken: string, ms: number) => {
    await api(spotifyToken, `/me/player/seek?position_ms=${ms}`, { method: "PUT" });
  };

  const pausePlayback = async (spotifyToken: string) => {
    try {
      await api(spotifyToken, "/me/player/pause", { method: "PUT" });
      console.log("⏸ Playback paused");
    } catch (error) {
      console.error("Error pausing playback:", error);
    }
  };

  // --- Main playback logic ---
  const startPlayback = async (spotifyToken: string) => {
    if (!isActiveRef.current) {
      console.log("⚠️ Component not active, skipping playback");
      return;
    }

    try {
      setIsLoading(true);

      const trackUri = `spotify:track:${data.moment.id}`;
      const startMs = Math.floor(data.moment.songStart * 1000);
      const endMs = Math.floor((data.moment.songStart + data.moment.songDuration) * 1000);

      console.log(`🎵 Starting playback for ${data.moment.title}`);

      let res = await api(spotifyToken, "/me/player/play", {
        method: "PUT",
        body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
      });

      if (res.status === 404 || res.status === 403 || res.status === 202) {
        console.log("⚠️ No active device, searching...");
        const devices = await getDevices(spotifyToken);

        if (devices.length === 0) throw new Error("No Spotify devices found.");

        const active = devices.find((d) => d.is_active && !d.is_restricted);
        const smartphone = devices.find((d) => d.type === "Smartphone" && !d.is_restricted);
        const any = devices.find((d) => !d.is_restricted);
        const target = active ?? smartphone ?? any;

        if (!target) throw new Error("No available Spotify devices.");

        await transferPlayback(spotifyToken, target.id);
        await new Promise((r) => setTimeout(r, 800));
        
        res = await api(
          spotifyToken,
          `/me/player/play?device_id=${encodeURIComponent(target.id)}`,
          {
            method: "PUT",
            body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
          }
        );
      }

      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        throw new Error(`Play error ${res.status}: ${txt}`);
      }

      if (!isActiveRef.current) {
        console.log("⚠️ Component became inactive during setup");
        await pausePlayback(spotifyToken);
        return;
      }

      console.log("✅ Playback started");
      setIsPlaying(true);
      setIsLoading(false);

      // Polling loop
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        if (!isActiveRef.current) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        try {
          const playbackRes = await api(spotifyToken, "/me/player");
          if (playbackRes.status === 204 || !playbackRes.ok) return;

          const playbackData = await playbackRes.json();
          const pos = playbackData.progress_ms ?? 0;

          if (pos > endMs || pos < startMs) {
            console.log(`🔁 Looping back to start`);
            await seekTo(spotifyToken, startMs);
          }
        } catch (error) {
          console.error("Error in playback loop:", error);
        }
      }, 500);
    } catch (error: any) {
      console.error("Playback error:", error);
      setIsLoading(false);
      Alert.alert("Playback Error", error.message || "Failed to start playback.");
    }
  };

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF0E2', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Jacques Francois', color: '#333C42' }}>
          No moment data available
        </Text>
      </View>
    );
  }

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
                    end={(data.moment.songStart + data.moment.songDuration) / data.moment.length}
                    duration={data.moment.songDuration}
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
  texxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333C42',
  },
});