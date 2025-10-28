// app/createProcess/momentProcess.tsx - Updated with proper navigation handling
import React, { useEffect } from 'react';
import BottomL from '../../assets/other/Bottom_L.svg';
import TopL from '../../assets/other/Top_L.svg';
import BottomM from '../../assets/other/Bottom_M.svg';
import TopM from '../../assets/other/Top_M.svg';
import BottomR from '../../assets/other/Bottom_R.svg';
import MomentPick from '../createProcess/momentPick';
import MomentSpecify from '../createProcess/momentSpecify';
import MomentFinalize from '../createProcess/momentFinalize';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { View, Image, Text, Animated, useWindowDimensions, Alert } from 'react-native';
import { useMomentStore } from "../stores/useMomentStore";
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useFocusEffect } from '@react-navigation/native';

const API_BASE = "https://api.spotify.com/v1";

type Device = {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  is_restricted: boolean;
};


const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

function bg1(width: number, height: number) {
  return (
    <View style={{ width: width, height: height, backgroundColor: "#FFF0E2" }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: 143, width: '100%' }}>
          <TopL />
        </View>
        <View style={{ aspectRatio: 0.78526, width: '101%' }}>
          <BottomL width="100%" height="100%" />
        </View>
      </View>
    </View>
  );
}

function bg2(width: number, height: number) {
  return (
    <View style={{ width: width, height: height, backgroundColor: "#FFF0E2" }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', height: 162.1, width: '100%' }}>
          <TopM />
        </View>
        <View style={{ aspectRatio: 0.83888, width: '101%', marginTop: 331 }}>
          <BottomM width="100%" height="100%" />
        </View>
      </View>
    </View>
  );
}

function bg3(width: number, height: number) {
  return (
    <View style={{ width: width, height: height, backgroundColor: "#FFF0E2" }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
          <BottomR width="100%" height="100%" />
        </View>
      </View>
    </View>
  );
}

export default function momentProcess() {
  console.log('MOMENT PROCESS PAGE MOUNTED');
  const moment = useMomentStore((s) => s.selectedMoment);
  const clearMoment = useMomentStore((s) => s.clearMoment);
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "You need to be signed in to create a moment",
        [
          {
            text: "OK",
            onPress: () => router.replace('/(tabs)/create')
          }
        ]
      );
    }
  }, [user]);

  const src = require('../../assets/images/stack.png');
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Save moment to database
  const saveMomentToDatabase = async () => {
    if (!user) {
      Alert.alert("Error", "You must be signed in to create a moment");
      return false;
    }

    if(!moment) return false;

    if (saving) return false;

    try {
      setSaving(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        Alert.alert("Error", "You are not signed in");
        return false;
      }
      
      // Build the Spotify URL from the track ID
      const songUrl = `https://open.spotify.com/track/${moment.id}`;

      const response = await fetch(`${nUrl}/api/moments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: moment.title,
          song_url: songUrl,
          start_time: Math.floor(moment.songStart),
          duration: Math.floor(moment.songDuration),
          cover_url: moment.album.uri || null,
          visibility: true,
          description: `${moment.artist}` // Store artist as description for now
        }),
      });

      const resp = await response.json();

      if (!response.ok) {
        console.error("Backend error:", resp);
        Alert.alert("Error", resp.error || "Failed to create moment");
        return false;
      }

      console.log("Moment created successfully:", resp);

      Alert.alert(
        "Success!",
        "Your moment has been created",
        [
          {
            text: "OK",
            onPress: () => {
              clearMoment();
              //router.dismissAll();
              router.replace('/(tabs)/profile');
            }
          }
        ]
      );

      return true;
    } catch (err) {
      console.error("Error creating moment:", err);
      Alert.alert("Error", "Failed to create moment. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Button powered page navigation
  const goToPage = async (page: number) => {
    // Handle back navigation from first page
    if (page === -1) {
      router.back();
      return;
    }

    // If going from page 2 (MomentFinalize) to page 0 (which would be completing the flow)
    // Save the moment to the database
    if (page === 10) {
      const success = await saveMomentToDatabase();
      if (!success) return; // Don't navigate if save failed
      //return; // saveMomentToDatabase handles navigation
    }

    // Animate scroll manually
    Animated.timing(scrollX, {
      toValue: page * width,
      duration: 400,
      useNativeDriver: false,
    }).start();

    scrollRef.current?.scrollTo({ x: page * width, animated: true });
  };

  // Interpolate the transforms for backgrounds
  const translateX = scrollX.interpolate({
    inputRange: [0, width, width * 2],
    outputRange: [0, -width, -width * 2],
    extrapolate: 'clamp',
  });

  const [headerWidth, setHeaderWidth] = useState(0);

  useEffect(() => {
    return () => clearMoment(); // Clear when unmounting
  }, []);

  //----------Spotify integration ----------------------
  const [token, setToken] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

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

  useEffect(() => {
  const initSpotify = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('spotifyToken');
      if (!storedToken) {
        Alert.alert(
          "Spotify Not Connected",
          "Please connect your Spotify account in Settings."
        );
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
    } catch (err) {
      console.error("Error initializing Spotify:", err);
      Alert.alert("Error", "Failed to initialize Spotify playback");
      setIsLoading(false);
    }
  };
  initSpotify();

  return () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };
}, []);


const playAt = async (start: number, duration: number) => {
  if (!token || !moment) return;
  try {
    setIsLoading(true);
    const trackUri = `spotify:track:${moment.id}`;
    const startMs = Math.floor(start * 1000);
    const endMs = Math.floor((start + duration) * 1000);

    let res = await api(token, "/me/player/play", {
      method: "PUT",
      body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
    });

    // Handle if no active Spotify device
    if (res.status === 404 || res.status === 403 || res.status === 202) {
      const devices = await getDevices(token);
      const target = devices.find((d) => d.is_active) || devices[0];
      if (!target) throw new Error("No active Spotify devices found.");
      await transferPlayback(token, target.id);
      await new Promise((r) => setTimeout(r, 800));
      await api(token, `/me/player/play?device_id=${target.id}`, {
        method: "PUT",
        body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
      });
    }

    setIsPlaying(true);
    setIsLoading(false);

    // clear any previous loop interval
    if (pollingRef.current) clearInterval(pollingRef.current);

    // Set up the loop — automatically restart when playback passes endMs
    pollingRef.current = setInterval(async () => {
      try {
        const playbackRes = await api(token, "/me/player");
        if (!playbackRes.ok) return;
        const playbackData = await playbackRes.json();
        const pos = playbackData.progress_ms ?? 0;
        if (pos > endMs) {
          await seekTo(token, startMs);
        }
      } catch (err) {
        console.error("Error polling playback:", err);
      }
    }, 500);
  } catch (err: any) {
    console.error("Playback error:", err);
    Alert.alert("Playback Error", err.message);
    setIsLoading(false);
  }
};

const pausePlayback = async () => {
  if (!token) return;
  try {
    await api(token, "/me/player/pause", { method: "PUT" });
    setIsPlaying(false);
  } catch (err) {
    console.error("Error pausing playback:", err);
  }
};

useFocusEffect(
  React.useCallback(() => {
    isActiveRef.current = true;

    if (token && moment) {
      // start playback automatically
      playAt(moment.songStart, moment.songDuration).catch(console.error);
    }

    return () => {
      isActiveRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [token, moment])
);



  
  if (!moment) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0E2' }}>
        <Text style={{ fontFamily: 'Jacques Francois', fontSize: 18, color: '#333C42' }}>
          No moment selected
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          width: width * 3,
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        {bg1(width, height)}
        {bg2(width, height)}
        {bg3(width, height)}
      </Animated.View>

      <View style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 0,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
      }}>
        <View style={{ justifyContent: 'flex-start', alignItems: 'center'}}>
          <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <View
              style={{ width: '90%', marginHorizontal: 30, borderWidth: 3, height: 10, borderRadius: 10, position: 'absolute' }}
              onLayout={(e) => setHeaderWidth(e.nativeEvent.layout.width)}
            >
              {headerWidth > 0 && (
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: 'black',
                    width: scrollX.interpolate({
                      inputRange: [0, width, 2 * width],
                      outputRange: [0, headerWidth / 2, headerWidth],
                      extrapolate: 'clamp',
                    }),
                    borderRadius: 10,
                  }}
                />
              )}
            </View>

            <View style={{ backgroundColor: 'black', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 100, borderWidth: 3 }}>
              <FontAwesome5 name="music" size={20} color="#8DD2CA" />
            </View>
            <View style={{ backgroundColor: 'white', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 100, borderWidth: 3 }}>
              <Ionicons name="text" size={20} color="black" />
            </View>
            <Image source={src} style={{ width: 40, height: 40 }} />
          </View>
        </View>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        <MomentPick 
          moment={moment} 
          scrollFunc={goToPage}
          playAt={playAt}
        />
        <MomentSpecify moment={moment} scrollFunc={goToPage}/>
        <MomentFinalize moment={moment} scrollFunc={goToPage} height={height} />
      </Animated.ScrollView>

      {saving && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#FFF0E2',
            padding: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#333C42'
          }}>
            <Text style={{ fontFamily: 'Jacques Francois', fontSize: 18, color: '#333C42' }}>
              Creating your moment...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}