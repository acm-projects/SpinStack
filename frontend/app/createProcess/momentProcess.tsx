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