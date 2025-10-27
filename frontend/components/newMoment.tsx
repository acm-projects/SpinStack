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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playbackSession = useRef(Math.random());

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

  // 🧭 Fix (2): Initialize token safely and defer playback until both token + focus are ready
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
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (token) {
        pausePlayback(token).catch(console.error);
      }
    };
  }, []);

  // 🧭 Fix (4): Use focus effect to control playback lifecycle safely
  useFocusEffect(
    React.useCallback(() => {
      console.log("🎧 MomentView focused");

      let didCancel = false;

      // Wait briefly to ensure token and Spotify device are ready
      const delayedStart = setTimeout(async () => {
        if (didCancel || !token) return;

        // Always stop any lingering playback session before starting new one
        await pausePlayback(token).catch(() => {});
        await startPlayback(token);
      }, 300);

      return () => {
        console.log("🛑 MomentView unfocused – stopping playback and clearing intervals");
        didCancel = true;
        clearTimeout(delayedStart);

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        if (token) {
          pausePlayback(token).catch(console.error);
        }

        spinAnim.stopAnimation();
        setIsPlaying(false);
      };
    }, [token])
  );

  // --- Spotify API helpers ---
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
    if (!res.ok) throw new Error(`devices: ${res.status}`);
    const deviceData = await res.json();
    return deviceData.devices as Device[];
  };

  const transferPlayback = async (token: string, deviceId: string) => {
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
      console.log("⏸ Playback paused");
    } catch (error) {
      console.error("Error pausing playback:", error);
    }
  };

  // --- Main playback logic ---
  const startPlayback = async (spotifyToken: string) => {
    try {
      setIsLoading(true);
      const thisSession = playbackSession.current;

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

      console.log("✅ Playback started");
      setIsPlaying(true);
      setIsLoading(false);

      // Polling loop
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        if (playbackSession.current !== thisSession) return; // stale instance
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

  // --- UI below unchanged ---
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
