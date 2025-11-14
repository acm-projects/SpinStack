import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions, Animated, Easing, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moment } from '../../components/momentInfo';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/_context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/constants/supabase';

// Add interface for props to include callbacks
interface MomentSpecifyViewProps {
  moment: Moment;
  scrollFunc: (page: number) => void;
  onImageSelected?: (uri: string, fileName: string) => void;
  onCaptionChange?: (caption: string) => void;
}

export default function MomentSpecifyView({
  moment,
  scrollFunc,
  onImageSelected,
  onCaptionChange
}: MomentSpecifyViewProps) {
  const src = require('../../assets/images/stack.png');
  const vinylImg = require('../../assets/images/vinyl.png');
  const { width } = useWindowDimensions();

  const bubbleHeight = 0.12533245892 * width;

  const [isSearchActive, setIsSearchActive] = useState(false);
  const fadeCaptionButton = useRef(new Animated.Value(1)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const { user } = useAuth();
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  const toggleSearch = () => {
    const toSearch = !isSearchActive;
    setIsSearchActive(toSearch);


    // If closing search, trigger the callback with the caption
    if (!toSearch && onCaptionChange) {
      onCaptionChange(caption);
    }

    Animated.parallel([
      Animated.timing(fadeCaptionButton, {
        toValue: toSearch ? 0 : 1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeSearch, {
        toValue: toSearch ? 1 : 0,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pickImage = async (): Promise<void> => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be signed in to upload an image.');
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;
      const image = result.assets[0];

      // Compress & convert to WebP
      const manipulatedImage = await ImageManipulator.manipulateAsync(image.uri, [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.WEBP,
      });

      const timestamp = Date.now();
      const fileName = `user_${user.id}_moment_${timestamp}.webp`;
      const fileType = 'image/webp';

      // Get presigned URL
      const presignRes = await fetch(`${nUrl}/api/upload/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType }),
      });

      const text = await presignRes.text();
      let uploadURL: string | undefined;
      try {
        uploadURL = JSON.parse(text).uploadURL;
      } catch {
        console.error('Server response was not JSON:', text);
        Alert.alert('Upload Error', 'Failed to get upload URL from server.');
        return;
      }

      if (!uploadURL) {
        console.error('No uploadURL returned by server');
        return;
      }

      // Upload to S3
      const fileData = await fetch(manipulatedImage.uri);
      const blob = await fileData.blob();
      const s3Res = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: blob
      });

      if (!s3Res.ok) {
        console.error('S3 upload failed', s3Res.status, await s3Res.text());
        Alert.alert('Upload Error', 'Failed to upload image to S3.');
        return;
      }

      // Store locally for preview & trigger callback with FILENAME ONLY (not full URL)
      setImageUri(manipulatedImage.uri);
      setImageFileName(fileName);
      if (onImageSelected) onImageSelected(fileName, fileName); // Pass fileName, not URI

      Alert.alert('Success', 'Moment image uploaded!');
    } catch (err) {
      console.error('Image upload error:', err);
      Alert.alert('Error', 'Something went wrong while uploading the image.');
    }
  };


  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: 0.5 * bubbleHeight }]}
        edges={['top', 'left', 'right']}
      >
        <View style={{ alignItems: 'flex-start', height: 2.5 * bubbleHeight, width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginLeft: 1.5 * bubbleHeight, marginTop: 2 * bubbleHeight }}>
          <TouchableOpacity onPress={() => scrollFunc(0)} style={{ alignItems: 'center' }}>
            <View style={{ position: 'absolute', alignItems: 'center', marginTop: 0.25 * bubbleHeight }}>
              <Bubble width={bubbleHeight} height={bubbleHeight} />
              <View style={{ marginTop: '-80%' }}>
                <Feather name="arrow-left" size={0.6 * bubbleHeight} color="black" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: bubbleHeight, height: bubbleHeight, width: 2.75 * bubbleHeight, marginLeft: -2.75 * bubbleHeight, }}>
            <Animated.View
              style={{
                opacity: fadeSearch,
                position: 'absolute',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F9DDC3',
                borderColor: '#2E3337',
                borderWidth: 2,
                borderRadius: 3,
                marginLeft: -4.5 * bubbleHeight,
                marginTop: 0.25 * bubbleHeight,
                paddingHorizontal: 0.5 * bubbleHeight,
                width: 5.5 * bubbleHeight,
                height: 1 * bubbleHeight,
              }}
            >
              <TouchableOpacity onPress={toggleSearch} style={{ position: 'absolute', marginLeft: 4.75 * bubbleHeight }}>
                <AntDesign name="check" size={bubbleHeight / 2} color="black" />
              </TouchableOpacity>
              <TextInput
                placeholder="Set moment caption:"
                placeholderTextColor="#515f69ff"
                style={{ position: 'absolute', marginLeft: 0.25 * bubbleHeight, fontSize: 16, fontFamily: "Lato" }}
                autoFocus={false}
                onEndEditing={toggleSearch}
                ref={textInputRef}
                value={caption}
                onChangeText={setCaption}
              />
            </Animated.View>

            <Animated.View style={{ opacity: fadeCaptionButton }}>
              <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => toggleSearch()}>
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                  <Bubble width={1.5 * bubbleHeight} height={1.5 * bubbleHeight} />
                  <View style={{ marginTop: '-80%' }}>
                    <AntDesign name="comment" size={0.53333 * 1.5 * bubbleHeight} color="black" />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={{ alignItems: 'center', marginTop: 1.4 * bubbleHeight }} onPress={pickImage}>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Bubble width={2 * bubbleHeight} height={2 * bubbleHeight} />
                <View style={{ marginTop: '-80%' }}>
                  <EvilIcons name="image" size={0.8 * 2 * bubbleHeight} color="black" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ width: '70%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
                  {/* Show custom image if uploaded, otherwise show album art */}
                  <Image
                    source={imageUri ? { uri: imageUri } : moment.album}
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
                  <Text
                    style={{ textAlign: 'center', fontSize: 0.6 * bubbleHeight, fontFamily: 'Lato', color: '#333C42' }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {moment.title} - {moment.artist}
                  </Text>

                  {/* Show caption if set */}
                  {caption && (
                    <Text style={{ fontSize: 0.4 * bubbleHeight, fontFamily: 'Lato', color: '#515f69ff', textAlign: 'center', marginTop: 5 }}>
                      "{caption}"
                    </Text>
                  )}
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
            onPress={() => {
              if (onCaptionChange) onCaptionChange(caption);
              scrollFunc(2);
            }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Lato' }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}