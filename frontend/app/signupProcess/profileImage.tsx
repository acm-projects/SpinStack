import React, { useState, useEffect } from 'react';

import { View, Text, Pressable, Image, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useRouter } from 'expo-router';
import * as Font from 'expo-font';
export default function ProfileImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
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
    <ImageBackground
      source={require("../../assets/images/signUpBackground.png")} //
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ marginBottom: 10, marginLeft: 10, paddingTop: 70 }}>
        <Pressable onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/backBubble.png")}
            style={{

            }}
          />

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
    </ImageBackground>
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
