import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';
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
  const { user, setProfileComplete } = useAuth();
  const router = useRouter();
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;


  const loadFonts = async () => {
    await Font.loadAsync({
      'Luxurious Roman': require('@/fonts/LuxuriousRoman-Regular.ttf'),
      'Jacques Francois': require('@/fonts/JacquesFrancois-Regular.ttf'),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  // Convert image to WebP and return new URI
  const convertToWebP = async (uri: string): Promise<string | null> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.WEBP,
        }
      );
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

      const uploadUrlRes = await fetch(
        `${nUrl}/api/upload/presigned-url`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, fileType }),
        }
      );

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

      const { error } = await supabase
        .from('users')
        .update({ pfp_url: fileName })
        .eq('id', user?.id);

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
    router.push("../signupProcess/spotifyConnect");
  };

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      <View style={{
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: "#FFF0E2",
      }}>
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>

      <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
        <Pressable onPress={() => router.back()}>
          <View style={{ marginBottom: 60, marginLeft: 10 }}>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Bubble width={50} height={50} />
              <View style={{ marginTop: -40 }}>
                <Feather name="arrow-left" size={30} color="black" />
              </View>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.container}>
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
        <Pressable onPress={handleNext}>
          <View style={{
            backgroundColor: "#333c42",
            width: 352,
            padding: 10,
            borderRadius: 8
          }}>
            <Text style={{
              color: "white",
              fontFamily: "Jacques Francois",
              textAlign: "center",
              fontSize: 16
            }}>Next</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 0 },
  title: {
    color: '#333C42',
    fontSize: 35,
    fontFamily: "Luxurious Roman",
    fontWeight: '600',
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
    alignItems: 'center'
  },
  plus: { color: '#333C42', fontSize: 48 },
  image: { width: 140, height: 140, borderRadius: 70 },
});
