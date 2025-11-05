import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moment } from '../../components/momentInfo';
import Feather from '@expo/vector-icons/Feather';
import Bubble from '../../assets/other/bubble.svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '@/constants/supabase';
import { useLocalSearchParams } from 'expo-router';


const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

export default function MomentFinalizeView({
  moment,
  scrollFunc,
  height,

}: {
  moment: Moment,
  scrollFunc: (page: number) => void,
  height: number,
  isStoryMode: boolean
}) {
  const src = require('../../assets/images/stack.png');
  const vinylImg = require('../../assets/images/vinyl.png');
  const { width } = useWindowDimensions();
  const [saving, setSaving] = useState(false);
  const { isStory } = useLocalSearchParams();
  const [isStoryMode, setIsStoryMode] = useState(isStory === "true");

  const bubbleHeight = 0.12533245892 * width;

  // Only post as story
  const postAsStory = async () => {
    if (!moment || saving) return;

    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        Alert.alert("Error", "You are not signed in");
        return;
      }
      const table = "story_moments";
      const songUrl = `https://open.spotify.com/track/${moment.id}`;

      const response = await fetch(`${nUrl}/api/${table}`, {
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
          description: `${moment.artist}`
        }),
      });

      const resp = await response.json();

      if (!response.ok) {
        console.error("Story backend error:", resp);
        Alert.alert("Error", resp.error || "Failed to create story moment");
        return;
      }

      console.log("Story moment posted successfully:", resp);
      Alert.alert("Success", "Your story moment has been created and will disappear in 24 hours");
    } catch (err) {
      console.error("Error posting story moment:", err);
      Alert.alert("Error", "Failed to create story moment. Please try again.");
    } finally {
      setSaving(false);
      setIsStoryMode(false);

    }
  };

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'center', gap: 1.5 * bubbleHeight }]}
        edges={['top', 'left', 'right']}
      >
        {/* Back Button & Action Row */}
        <View style={{ alignItems: 'flex-start', width: '100%', height: 1 * bubbleHeight, flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 0.65 * bubbleHeight, marginTop: 2 * bubbleHeight }}>

          {/* Back Button */}
          <TouchableOpacity onPress={() => scrollFunc(1)} style={{ alignItems: 'center' }}>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Bubble width={bubbleHeight} height={bubbleHeight} />
              <View style={{ marginTop: '-80%' }}>
                <Feather name="arrow-left" size={0.6 * bubbleHeight} color="black" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Polaroid / Stack Bubble */}
          {!isStoryMode && (
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 0.25 * bubbleHeight, marginLeft: 1.5 * bubbleHeight }}>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Bubble width={1.6 * bubbleHeight} height={1.6 * bubbleHeight} />
                <View style={{ marginTop: '-87.5%' }}>
                  <MaterialCommunityIcons name="polaroid" size={0.75 * 1.6 * bubbleHeight} color="black" />
                </View>
              </View>
            </TouchableOpacity>
          )}


          {/* Story post button (only if not story) */}
          {!isStoryMode && (
            <TouchableOpacity
              onPress={postAsStory}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 1.5 * bubbleHeight,
                position: 'relative',
              }}
            >
              <Bubble width={1.6 * bubbleHeight} height={1.6 * bubbleHeight} />
              <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="plus" size={0.75 * 1.6 * bubbleHeight} color="black" />
              </View>
            </TouchableOpacity>
          )}

        </View>

        {/* Content */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ width: '70%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
                  <Image
                    source={moment.album}
                    style={{ width: '40%', aspectRatio: 1, height: undefined }}
                  />
                  <Image
                    source={vinylImg}
                    style={{ width: '100%', aspectRatio: 1, height: undefined, position: 'absolute' }}
                  />
                </View>
              </View>
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 0.6*bubbleHeight }}>
                <View style={{ marginLeft: 0.2*bubbleHeight }}>
                  <Text style={{ fontSize: 0.6*bubbleHeight, fontFamily: 'Lato', fontWeight: 'bold', color: '#333C42' }}>
                    {moment.title} - {moment.artist}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#39868F',
              borderRadius: 10,
              borderWidth: 4,
              borderColor: '#333C42',
              alignItems: 'center',
              width: '60%',
            }}
            onPress={() => scrollFunc(10)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Lato' }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
