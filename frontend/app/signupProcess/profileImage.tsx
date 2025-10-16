import React, { useState, useEffect } from 'react';

import { View, Text, Pressable, Image, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useRouter } from 'expo-router';
import * as Font from 'expo-font';
import { useAuth } from '@/_context/AuthContext';
import { supabase } from '@/constants/supabase';


import OpeningSplash from '../../assets/other/openingSplash.svg';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';

export default function ProfileImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { user, session, loading, signingUp, setSigningUp, pfpUrl, setPfpUrl, profileComplete, setProfileComplete } = useAuth();


  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // still correct in TS
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const image = result.assets[0];
      const fileUri = image.uri;
      const fileName = image.fileName || `user_${user?.id}_profile.jpg`;
      const fileType = fileUri.endsWith('.png') ? 'image/png' : 'image/jpeg';

      // Show local image immediately
      setImageUri(fileUri);

      // Request presigned upload URL from backend
      let uploadURL: string | undefined;
      try {
        const uploadUrlRes = await fetch(
          'https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/presigned-url',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, fileType }),
          }
        );

        // Read response body only once
        const text = await uploadUrlRes.text();
        try {
          const json = JSON.parse(text);
          uploadURL = json.uploadURL;
        } catch {
          console.error('Server response was not JSON:', text);
          Alert.alert('Upload Error', 'Failed to get upload URL from server.');
          return;
        }

        if (!uploadURL) {
          console.error('No uploadURL returned by server');
          return;
        }
      } catch (err) {
        console.error('Network error fetching upload URL:', err);
        Alert.alert('Upload Error', 'Failed to fetch upload URL.');
        return;
      }

      // Upload image to S3
      try {
        const fileData = await fetch(fileUri);
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
      } catch (err) {
        console.error('S3 upload error:', err);
        Alert.alert('Upload Error', 'Failed to upload image to S3.');
        return;
      }

      // Update Supabase with object key
      const { data, error } = await supabase
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
    setProfileComplete(true);
    router.push("../signupProcess/spotifyConnect");


  };

  return (
    <View style = {[StyleSheet.absoluteFill, {flex: 1}]}>
      <View
        style={{
          flex: 1,
          position: 'absolute',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: "#FFF0E2",
        }}
      >
        <OpeningSplash width="100%" height="100%" style = {{marginTop: -30}}/>
      </View>
      <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
        <Pressable onPress={() => router.back()}>
          <View style = {{marginBottom: 60, marginLeft: 10}}>
              <View style = {{position: 'absolute', alignItems: 'center'}}>
                <Bubble width = {50} height = {50}/>
                <View style = {{marginTop: -40}}>
                  <Feather name="arrow-left" size={30} color="black"/>
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
        <Pressable onPress={() => router.push("./spotifyConnect")}>
          <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontFamily: "Jacques Francois", textAlign: "center", fontSize: 16 }}>Next</Text>

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
  placeholder: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#333C42', justifyContent: 'center', alignItems: 'center' },
  plus: { color: '#333C42', fontSize: 48 },
  image: { width: 140, height: 140, borderRadius: 70 },
  button: {
    justifyContent: 'center',
    backgroundColor: '#333C42',
    borderColor: '#0BFFE3',
    borderWidth: 2,
    borderRadius: 10,
    width: '90%',
    height: '8%',
  },
  buttonText: {
    color: '#ffffffff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
});
