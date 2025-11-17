import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions, Alert, Modal, Pressable, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
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
  uploadedImageUrl,
  selectedStackIds, 
  onStackSelectionChange,
}: {
  moment: Moment,
  scrollFunc: (page: number) => void,
  height: number,
  isStoryMode: boolean,
  uploadedImageUrl?: string,
  selectedStackIds?: string[],
  onStackSelectionChange?: (stackIds: string[]) => void,
}) {

  const src = require('../../assets/images/stack.png');
  const vinylImg = require('../../assets/images/vinyl.png');
  const { width } = useWindowDimensions();
  const [saving, setSaving] = useState(false);
  const { isStory } = useLocalSearchParams();
  const [isStoryMode, setIsStoryMode] = useState(isStory === "true");
  const [imageDownloadUrl, setImageDownloadUrl] = useState<string | null>(null);
  const [momentsInStacks, setMomentsInStacks] = useState<{ stack_id: string; position: number }[]>([]);
  const [loadingMoments, setLoadingMoments] = useState(false);
  const [addToStackVisible, setAddToStackVisible] = useState(false);
  const [userStacks, setUserStacks] = useState<any[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(false);
  const [localSelectedStackIds, setLocalSelectedStackIds] = useState<string[]>(selectedStackIds || []);

  const bubbleHeight = 0.12533245892 * width;

  // --- Floating animation helpers ---
  const floatY = (anim: Animated.Value, amplitude: number) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] });
  const floatX = (anim: Animated.Value, amplitude: number) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [0, amplitude] });

  const createFloatAnim = (anim: Animated.Value, duration: number, delay: number = 0) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // --- Animated Values ---
  const backBubbleAnim = useRef(new Animated.Value(0)).current;
  const stackBubbleAnim = useRef(new Animated.Value(0)).current;
  const storyBubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    createFloatAnim(backBubbleAnim, 1800, 0);
    createFloatAnim(stackBubbleAnim, 2000, 100);
    createFloatAnim(storyBubbleAnim, 2200, 200);
  }, []);

  // Fetch presigned download URL when component mounts or uploadedImageUrl changes
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (uploadedImageUrl) {
        try {
          const res = await fetch(`${nUrl}/api/upload/download-url/${uploadedImageUrl}`);
          if (res.ok) {
            const { downloadURL } = await res.json();
            setImageDownloadUrl(downloadURL);
          } else {
            console.error("Failed to fetch presigned URL:", res.status);
          }
        } catch (err) {
          console.error("Error fetching presigned URL:", err);
        }
      }
    };
    fetchImageUrl();
  }, [uploadedImageUrl]);

  const fetchUserStacks = async () => {
    try {
      setLoadingStacks(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const res = await fetch(`${nUrl}/api/stacks`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const stacks = await res.json();
        setUserStacks(stacks);
      } else {
        console.error("Failed to fetch stacks:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching user stacks:", err);
    } finally {
      setLoadingStacks(false);
    }
  };

  const toggleStackSelection = (stackId: string) => {
    const newSelection = localSelectedStackIds.includes(stackId)
      ? localSelectedStackIds.filter(id => id !== stackId)
      : [...localSelectedStackIds, stackId];
    setLocalSelectedStackIds(newSelection);
    if (onStackSelectionChange) onStackSelectionChange(newSelection);
  };

  const openStackModal = async () => {
    setLoadingMoments(true);
    const { data: momentsData, error: momentsError } = await supabase
      .from('moments_in_stacks')
      .select('stack_id, position');
    if (momentsError) console.error(momentsError);
    else setMomentsInStacks(momentsData || []);
    setLoadingMoments(false);
    fetchUserStacks();
    setAddToStackVisible(true);
  };

  const postAsStory = async () => {
    if (!moment || saving) return;
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { Alert.alert("Error", "You are not signed in"); return; }

      const table = "story_moments";
      const songUrl = `https://open.spotify.com/track/${moment.id}`;

      const response = await fetch(`${nUrl}/api/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      if (!response.ok) { console.error("Story backend error:", resp); Alert.alert("Error", resp.error || "Failed to create story moment"); return; }

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
            <Animated.View
              style={{
                position: 'absolute',
                alignItems: 'center',
                marginTop: -20,
                marginLeft: 20,
                transform: [
                  { translateY: floatY(backBubbleAnim, 6) },
                  { translateX: floatX(backBubbleAnim, 3) },
                ],
              }}
            >
              <Bubble width={bubbleHeight} height={bubbleHeight} />
              <View style={{ marginTop: '-80%' }}>
                <Feather name="arrow-left" size={0.6 * bubbleHeight} color="black" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Add to Stack Bubble */}
          {!isStoryMode && (
            <TouchableOpacity onPress={openStackModal} style={{ alignItems: 'center', marginTop: 0.25 * bubbleHeight, marginLeft: 1.5 * bubbleHeight }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  alignItems: 'center',
                  paddingTop: 70,
                  paddingRight: 90,
                  transform: [
                    { translateY: floatY(stackBubbleAnim, 6) },
                    { translateX: floatX(stackBubbleAnim, 3) },
                  ],
                }}
              >
                <Bubble width={1.6 * bubbleHeight} height={1.6 * bubbleHeight} />
                <View style={{ marginTop: '-87.5%' }}>
                  <MaterialCommunityIcons name="polaroid" size={0.75 * 1.6 * bubbleHeight} color="black" />
                  {localSelectedStackIds.length > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#39868F',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {localSelectedStackIds.length}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Story post bubble */}
          {!isStoryMode && (
            <TouchableOpacity
              onPress={postAsStory}
              style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 1.5 * bubbleHeight, position: 'relative' }}
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  alignItems: 'center',
                  paddingRight: 120,
                  paddingTop: 165,
                  transform: [
                    { translateY: floatY(storyBubbleAnim, 6) },
                    { translateX: floatX(storyBubbleAnim, 3) },
                  ],
                }}
              >
                <Bubble width={1.4 * bubbleHeight} height={1.4 * bubbleHeight} />
                <View style={{ marginTop: '-93%' }}>
                  <MaterialCommunityIcons name="plus" size={0.75 * 1.6 * bubbleHeight} color="black" />
                </View>
              </Animated.View>
            </TouchableOpacity>
          )}

        </View>

        {/* Content */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ width: '70%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={imageDownloadUrl ? { uri: imageDownloadUrl } : moment.album} style={{ width: '40%', aspectRatio: 1, height: undefined }} />
                  <Image source={vinylImg} style={{ width: '100%', aspectRatio: 1, height: undefined, position: 'absolute' }} />
                </View>
              </View>

              {/* SONG + ARTIST BLOCK */}
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 0.6 * bubbleHeight }}>
                <View style={{ marginLeft: 0.2 * bubbleHeight, maxWidth: '90%' }}>
                  <Text
                    style={{
                      fontSize: 0.6 * bubbleHeight,
                      fontFamily: 'Lato',
                      fontWeight: '400',
                      color: '#333C42',
                      alignSelf: "center"
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {moment.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 0.45 * bubbleHeight,
                      fontFamily: 'Lato',
                      color: '#777777',
                      fontStyle: 'italic',
                      marginTop: 2,
                      alignSelf: "center"
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {moment.artist}
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
              backgroundColor: '#333C42',
              borderRadius: 30,
              borderWidth: 4,
              borderColor: '#333C42',
              alignItems: 'center',
              width: '60%',
            }}
            onPress={() => scrollFunc(10)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24, marginVertical: 5, fontFamily: 'Lato' }}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Add to Stacks Modal remains unchanged */}
      {/* ... modal code here ... */}

    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  friendsPopup: { width: "85%", backgroundColor: "#FFF0E2", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  popupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  popupTitle: { fontFamily: "Lato", fontSize: 22, color: "#333C42", fontWeight: "bold" },
  popupContent: { justifyContent: "center", alignItems: "center", minHeight: 100 },
  stackOption: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderBottomColor: "#ddd", borderBottomWidth: 1, width: "100%" },
  stackText: { marginLeft: 10, fontFamily: "Lato", color: "#333C42", fontSize: 16 },
});
