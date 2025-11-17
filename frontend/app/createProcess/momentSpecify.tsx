import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions, Animated, Easing, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moment } from '../../components/momentInfo';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useAuth } from '@/_context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

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
  const { width } = useWindowDimensions();
  const bubbleHeight = 0.125 * width;

  const [isSearchActive, setIsSearchActive] = useState(false);
  const fadeCaptionButton = useRef(new Animated.Value(1)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const { user } = useAuth();
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  const vinylImg = require('../../assets/images/vinyl.png');

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

  const backBubbleAnim = useRef(new Animated.Value(0)).current;
  const commentBubbleAnim = useRef(new Animated.Value(0)).current;
  const imageBubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    createFloatAnim(backBubbleAnim, 1800, 0);
    createFloatAnim(commentBubbleAnim, 2200, 150);
    createFloatAnim(imageBubbleAnim, 2000, 300);
  }, []);

  // --- Pulsing Next button ---
  const nextPulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(nextPulseAnim, { toValue: 1.03, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(nextPulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const toggleSearch = () => {
    const toSearch = !isSearchActive;
    setIsSearchActive(toSearch);
    if (!toSearch && onCaptionChange) onCaptionChange(caption);

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
      if (!user) return Alert.alert('Error', 'You must be signed in to upload an image.');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Allow access to photos.');

      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
      if (result.canceled || !result.assets?.length) return;
      const image = result.assets[0];

      const manipulatedImage = await ImageManipulator.manipulateAsync(image.uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP });
      const timestamp = Date.now();
      const fileName = `user_${user.id}_moment_${timestamp}.webp`;
      const fileType = 'image/webp';

      const presignRes = await fetch(`${nUrl}/api/upload/presigned-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName, fileType }) });
      const text = await presignRes.text();
      const uploadURL = JSON.parse(text).uploadURL;
      if (!uploadURL) return Alert.alert('Upload Error', 'Failed to get upload URL.');

      const blob = await (await fetch(manipulatedImage.uri)).blob();
      const s3Res = await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': fileType }, body: blob });
      if (!s3Res.ok) return Alert.alert('Upload Error', 'Failed to upload image.');

      setImageUri(manipulatedImage.uri);
      setImageFileName(fileName);
      if (onImageSelected) onImageSelected(fileName, fileName);
      Alert.alert('Success', 'Moment image uploaded!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while uploading the image.');
    }
  };

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView style={[StyleSheet.absoluteFill, { flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: 0.5 * bubbleHeight }]} edges={['top', 'left', 'right']}>
        {/* --- Top Bar --- */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '90%',
          height: 2.5 * bubbleHeight,
          marginTop: 2 * bubbleHeight
        }}>
          {/* Back Bubble */}
          <Animated.View
            style={{
              opacity: fadeCaptionButton,
              marginBottom: 50,
              transform: [
                { translateY: floatY(backBubbleAnim, 6) },
                { translateX: floatX(backBubbleAnim, 3) },
              ],
            }}
          >
            <TouchableOpacity onPress={() => scrollFunc(0)} style={{ alignItems: 'center', }}>
              <Bubble width={bubbleHeight} height={bubbleHeight} />
              <Feather name="arrow-left" size={0.6 * bubbleHeight} color="black" style={{ position: 'absolute', top: '22%' }} />
            </TouchableOpacity>
          </Animated.View>

          {/* Right Side Bubbles */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: bubbleHeight, paddingLeft: 130, paddingRight: 0 }}>
            {/* Caption Text Input */}
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
                marginLeft: -.24 * bubbleHeight,
                marginTop: -1 * bubbleHeight,
                paddingHorizontal: 0.5 * bubbleHeight,
                width: 5.5 * bubbleHeight,
                height: 1 * bubbleHeight,
              }}
            >
              <TouchableOpacity onPress={toggleSearch} style={{ position: 'absolute', right: 0.25 * bubbleHeight }}>
                <AntDesign name="check" size={bubbleHeight / 2} color="black" />
              </TouchableOpacity>
              <TextInput
                placeholder="Set moment caption:"
                placeholderTextColor="#515f69ff"
                style={{ flex: 1, paddingRight: bubbleHeight, fontSize: 16, fontFamily: "Lato" }}
                autoFocus={false}
                onEndEditing={toggleSearch}
                ref={textInputRef}
                value={caption}
                onChangeText={setCaption}
              />
            </Animated.View>

            {/* Comment Bubble */}
            <View style={{ marginRight: 40 }}>
              <Animated.View
                style={{
                  opacity: fadeCaptionButton,
                  transform: [
                    { translateY: floatY(commentBubbleAnim, 6) },
                    { translateX: floatX(commentBubbleAnim, 3) },
                  ],
                }}
              >
                <TouchableOpacity onPress={toggleSearch} style={{ alignItems: 'center' }}>
                  <Bubble width={1.5 * bubbleHeight} height={1.5 * bubbleHeight} />
                  <AntDesign name="comment" size={0.53333 * 1.5 * bubbleHeight} color="black" style={{ position: 'absolute', top: '25%' }} />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Image Bubble */}
            <View style={{ marginLeft: -95, paddingTop: 120 }}>
              <Animated.View
                style={{
                  transform: [
                    { translateY: floatY(imageBubbleAnim, 8) },
                    { translateX: floatX(imageBubbleAnim, 4) },
                  ],
                }}
              >
                <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center' }}>
                  <Bubble width={2 * bubbleHeight} height={2 * bubbleHeight} />
                  <EvilIcons name="image" size={0.8 * 2 * bubbleHeight} color="black" style={{ position: 'absolute', top: '20%' }} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* --- Content --- */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ width: '70%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={imageUri ? { uri: imageUri } : moment.album} style={{ width: '40%', aspectRatio: 1, height: undefined }} />
                  <Image source={vinylImg} style={{ width: '100%', aspectRatio: 1, height: undefined, position: 'absolute' }} />
                </View>
              </View>
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 0.6 * bubbleHeight }}>
                <View style={{ marginLeft: 0.2 * bubbleHeight, alignItems: 'center' }}>
                  <Text style={styles.titleArtist} numberOfLines={1} ellipsizeMode="tail">{moment.title}</Text>
                  <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">{moment.artist}</Text>
                  {caption && <Text style={styles.caption}>"{caption}"</Text>}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* --- Next Button --- */}
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ scale: nextPulseAnim }], width: '60%' }}>
            <TouchableOpacity style={styles.nextButton} onPress={() => { if (onCaptionChange) onCaptionChange(caption); scrollFunc(2); }}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleArtist: { textAlign: 'center', fontSize: 24, fontFamily: 'Lato', color: '#333C42' },
  artist: { textAlign: 'center', fontSize: 18, fontFamily: 'LatoItalic', color: '#717679ff' },
  caption: { fontSize: 12, fontFamily: 'LatoItalic', color: '#515f69ff', textAlign: 'center', marginTop: 5 },
  nextButton: { backgroundColor: '#333C42', borderRadius: 30, borderWidth: 4, borderColor: '#333C42', alignItems: 'center', width: '100%', marginTop: 50 },
  nextText: { color: 'white', fontWeight: 'bold', fontSize: 24, marginVertical: 5, fontFamily: 'Lato' },
});