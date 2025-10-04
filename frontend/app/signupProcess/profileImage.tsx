import React, { useState, useEffect } from 'react';

import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useRouter } from 'expo-router';
export default function ProfileImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
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

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }

  };
  const handleNext = () => {
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
  title: { color: '#fff',
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 75, },
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
