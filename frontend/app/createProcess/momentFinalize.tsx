import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions, Alert, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
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
  selectedStackIds, // NEW: Array of stack IDs to add moment to
  onStackSelectionChange, // NEW: Callback when stack selection changes
}: {
  moment: Moment,
  scrollFunc: (page: number) => void,
  height: number,
  isStoryMode: boolean,
  uploadedImageUrl?: string,
  selectedStackIds?: string[], // NEW
  onStackSelectionChange?: (stackIds: string[]) => void, // NEW
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

  // Fetch presigned download URL when component mounts or uploadedImageUrl changes
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (uploadedImageUrl) {
        try {
          const res = await fetch(
            `${nUrl}/api/upload/download-url/${uploadedImageUrl}`
          );
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

  // NEW: Fetch user's stacks
  const fetchUserStacks = async () => {
    try {
      setLoadingStacks(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const res = await fetch(`${nUrl}/api/stacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  // NEW: Toggle stack selection
  const toggleStackSelection = (stackId: string) => {
    const newSelection = localSelectedStackIds.includes(stackId)
      ? localSelectedStackIds.filter(id => id !== stackId)
      : [...localSelectedStackIds, stackId];

    setLocalSelectedStackIds(newSelection);
    if (onStackSelectionChange) {
      onStackSelectionChange(newSelection);
    }
  };

  // Open stack selection modal (fixed)
  const openStackModal = async () => {
    console.log("opening stack modal");

    setLoadingMoments(true);

    // Fetch moments in stacks first
    const { data: momentsData, error: momentsError } = await supabase
      .from('moments_in_stacks')
      .select('stack_id, position');
    if (momentsError) console.error(momentsError);
    else setMomentsInStacks(momentsData || []);

    setLoadingMoments(false);

    // Fetch user stacks as before
    fetchUserStacks();

    // Open modal
    setAddToStackVisible(true);
  };


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

          {/* Add to Stack Bubble */}
          {!isStoryMode && (
            <TouchableOpacity
              onPress={openStackModal}
              style={{ alignItems: 'center', marginTop: 0.25 * bubbleHeight, marginLeft: 1.5 * bubbleHeight }}
            >
              <View style={{ position: 'absolute', alignItems: 'center' }}>
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
                    source={imageDownloadUrl ? { uri: imageDownloadUrl } : moment.album}
                    style={{ width: '40%', aspectRatio: 1, height: undefined }}
                  />

                  <Image
                    source={vinylImg}
                    style={{ width: '100%', aspectRatio: 1, height: undefined, position: 'absolute' }}
                  />
                </View>
              </View>
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 0.6 * bubbleHeight }}>
                <View style={{ marginLeft: 0.2 * bubbleHeight }}>
                  <Text style={{ fontSize: 0.6 * bubbleHeight, fontFamily: 'Lato', fontWeight: 'bold', color: '#333C42' }}>
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

      {/* Add to Stacks Modal */}
      <Modal
        visible={addToStackVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddToStackVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsPopup}>
            {/* Header */}
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Add to Stacks</Text>
              <Pressable onPress={() => setAddToStackVisible(false)}>
                <Feather name="x" size={26} color="#333C42" />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.popupContent}>
              {loadingStacks || loadingMoments ? (
                <ActivityIndicator size="large" color="#333C42" />
              ) : (
                <ScrollView style={{ width: "100%", maxHeight: 400 }}>
                  {userStacks.length === 0 ? (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#333C42",
                        fontFamily: "Lato",
                      }}
                    >
                      No stacks yet. Create one on your profile!
                    </Text>
                  ) : (
                    userStacks.map((stack) => {
                      // Determine max position in this stack
                      const maxPositionInStack = Math.max(
                        -1,
                        ...momentsInStacks
                          .filter((mis) => mis.stack_id === stack.id)
                          .map((mis) => mis.position)
                      );

                      // Full if positions 0-4 are filled
                      const isFull = maxPositionInStack >= 4;

                      // Selected only if not full
                      const isSelected =
                        localSelectedStackIds.includes(stack.id) && !isFull;

                      return (
                        <TouchableOpacity
                          key={stack.id}
                          disabled={isFull} // prevent interaction
                          style={[
                            styles.stackOption,
                            isSelected && { backgroundColor: "#E8F5E9" },
                            isFull && { opacity: 0.5, backgroundColor: "#f0f0f0" },
                          ]}
                          onPress={() => {
                            if (isFull) {
                              Alert.alert(
                                "Stack Full",
                                "This stack already has 5 moments."
                              );
                              return;
                            }

                            // Toggle selection
                            const updated = isSelected
                              ? localSelectedStackIds.filter(
                                (id) => id !== stack.id
                              )
                              : [...localSelectedStackIds, stack.id];

                            setLocalSelectedStackIds(updated);
                            if (onStackSelectionChange)
                              onStackSelectionChange(updated);
                          }}
                        >
                          <Feather
                            name={isSelected ? "check-square" : "square"}
                            size={20}
                            color={isSelected ? "#4CAF50" : "#333C42"}
                          />
                          <Text
                            style={[
                              styles.stackText,
                              isSelected && { color: "#4CAF50", fontWeight: "bold" },
                              isFull && { color: "#999" },
                            ]}
                          >
                            {stack.title} {isFull ? "(Full)" : ""}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}

              {/* Done Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#39868F",
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  marginTop: 15,
                  borderWidth: 2,
                  borderColor: "#333C42",
                }}
                onPress={() => setAddToStackVisible(false)}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                    fontFamily: "Lato",
                  }}
                >
                  Done ({localSelectedStackIds.length} selected)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  friendsPopup: {
    width: "85%",
    backgroundColor: "#FFF0E2",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  popupTitle: {
    fontFamily: "Lato",
    fontSize: 22,
    color: "#333C42",
    fontWeight: "bold",
  },
  popupContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  stackOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    width: "100%",
  },
  stackText: {
    marginLeft: 10,
    fontFamily: "Lato",
    color: "#333C42",
    fontSize: 16,
  },
});