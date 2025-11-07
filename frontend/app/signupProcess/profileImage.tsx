import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert, Animated, Easing } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import { useAuth } from '@/_context/AuthContext';
import { supabase } from '@/constants/supabase';

import OpeningSplash from '../../assets/other/openingSplash.svg';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';

export default function ProfileImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  // Fade + Slide-up Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Back button pulse animation
  const backPulseAnim = useRef(new Animated.Value(1)).current;

  // Next button pulsing animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadFonts = async () => {
    await Font.loadAsync({
      'Luxurious Roman': require('@/fonts/LuxuriousRoman-Regular.ttf'),
      'Jacques Francois': require('@/fonts/JacquesFrancois-Regular.ttf'),
      'Lato': require('@/fonts/Lato-Regular.ttf'),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
    // Fade + slide animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();

    // Continuous pulsing for Next button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05, // max scale
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // back to normal
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!fontsLoaded) return null;

  const convertToWebP = async (uri: string): Promise<string | null> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.WEBP,
      });
      return manipulatedImage.uri;
    } catch (err) {
      console.error('WebP conversion error:', err);
      Alert.alert('Error', 'Failed to convert image to WebP.');
      return null;
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
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
      const webpUri = await convertToWebP(image.uri);
      if (!webpUri) return;
      setImageUri(webpUri);

      const fileName = `user_${user?.id}_profile.webp`;
      const fileType = 'image/webp';

      const uploadUrlRes = await fetch(`${nUrl}/api/upload/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType }),
      });

      const text = await uploadUrlRes.text();
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

      const fileData = await fetch(webpUri);
      const blob = await fileData.blob();

      const s3Res = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: blob,
      });

      if (!s3Res.ok) {
        console.error('S3 upload failed', s3Res.status, await s3Res.text());
        Alert.alert('Upload Error', 'Failed to upload image to S3.');
        return;
      }

      const { error } = await supabase.from('users').update({ pfp_url: fileName }).eq('id', user?.id);

      if (error) {
        console.error('Failed to update Supabase:', error);
        Alert.alert('Database Error', 'Failed to save profile picture.');
        return;
      }

      Alert.alert('Success', 'Profile picture uploaded successfully!');
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong while uploading the profile picture.');
    }
  };

  const handleNext = () => {
    router.push('../signupProcess/spotifyConnect');
  };

  const handleBackPress = () => {
    Animated.sequence([
      Animated.timing(backPulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(backPulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => router.back());
  };

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      {/* Background */}
      <View style={{ flex: 1, position: 'absolute', width: '100%', height: '100%', backgroundColor: '#FFF0E2' }}>
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>

      {/* Animated wrapper */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', paddingTop: 100 }}>
        {/* Back Button with Pressed Pulse */}
        <Pressable onPress={handleBackPress} style={{ marginBottom: 70, paddingRight: 320, paddingTop: 10 }}>
          <Animated.View style={{ transform: [{ scale: backPulseAnim }], position: 'absolute', alignItems: 'center' }}>
            <Bubble width={50} height={50} />
            <View style={{ marginTop: -40 }}>
              <Feather name="arrow-left" size={30} color="black" />
            </View>
          </Animated.View>
        </Pressable>

        <Text style={styles.title}>Add a Profile Picture</Text>

        <Pressable style={styles.imageContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.plus}>＋</Text>
            </View>
          )}
        </Pressable>

        {/* Pulsing Next Button */}
        <Pressable onPress={handleNext}>
          <Animated.View style={[styles.nextButton, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.nextButtonText}>Next</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#333C42',
    fontSize: 35,
    fontFamily: 'Lato',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 75,
  },
  imageContainer: { marginBottom: 240, paddingTop: 85 },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#333C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: { color: '#333C42', fontSize: 48 },
  image: { width: 140, height: 140, borderRadius: 70 },
  nextButton: { backgroundColor: '#333c42', width: 352, padding: 10, borderRadius: 8 },
  nextButtonText: { color: 'white', fontFamily: 'Lato', textAlign: 'center', fontSize: 16 },
});
