import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { router, useRouter } from 'expo-router';
import { useAuth } from '@/_context/AuthContext';
import { supabase } from '@/constants/supabase';

export default function ProfileImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { user, session, loading, signingUp, setSigningUp, pfpUrl, setPfpUrl, profileComplete, setProfileComplete } = useAuth();


  // Convert image to WebP and return new URI
  const convertToWebP = async (uri: string): Promise<string | null> => {
    console.log(uri);
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [], // no transforms, just format conversion
        {
          compress: 0.8, // compression quality
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
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const image = result.assets[0];
      const originalUri = image.uri;

      // Convert to WebP
      const webpUri = await convertToWebP(originalUri);
      if (!webpUri) return;

      // Show converted image in UI
      setImageUri(webpUri);

      // Prepare upload info
      const fileName = `user_${user?.id}_profile.webp`;
      const fileType = 'image/webp';

      // Get presigned URL from backend
      const uploadUrlRes = await fetch(
        'https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/presigned-url',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, fileType }),
        }
      );

      const text = await uploadUrlRes.text();
      let uploadURL: string | undefined;
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

      // Read the file as a blob (works on all modern Expo SDKs)
      const fileData = await fetch(webpUri);
      const blob = await fileData.blob();

      // Upload directly to S3 using fetch
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

      // Update Supabase user profile record
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
    setProfileComplete(true);
    router.push("../signupProcess/spotifyConnect");

  };

  return (
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
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000', paddingTop: 75 },
  title: {
    color: '#fff',
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 75,
  },
  imageContainer: { marginBottom: 75 },
  placeholder: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
  plus: { color: '#888', fontSize: 48 },
  image: { width: 140, height: 140, borderRadius: 70 },
  button: {
    justifyContent: 'center',
    backgroundColor: '#272727',
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
