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

export default function MomentSpecifyView({ moment, scrollFunc }: { moment: Moment, scrollFunc: (page: number) => void }) {
  const src = require('../../assets/images/stack.png');
  const vinylImg = require('../../assets/images/vinyl.png');
  const { width } = useWindowDimensions();

  const bubbleHeight = 0.12533245892 * width;

  const [isSearchActive, setIsSearchActive] = useState(false);
  const fadeCaptionButton = useRef(new Animated.Value(1)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef(null);
  const [caption, setCaption] = useState('');

  const toggleSearch = () => {
      const toSearch = !isSearchActive;
      setIsSearchActive(toSearch);

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

  const [imageUri, setImageUri] = useState<string | null>(null);
  const { user, setProfileComplete } = useAuth();
  const router = useRouter();
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

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
        
        //?
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
          Alert.alert('Database Error', 'Failed to save moment picture.');
          return;
        }
  
        Alert.alert('Success', 'Profile picture uploaded successfully!');
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'Something went wrong while uploading the picture picture.');
      }
    };
  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: 0.5*bubbleHeight}]}
        edges={['top', 'left', 'right']}
      >
        <View style={{ alignItems: 'flex-start', height: 2.5 * bubbleHeight, width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginLeft: 1.5 * bubbleHeight, marginTop: 2 * bubbleHeight}}>
          <TouchableOpacity onPress={() => scrollFunc(0)} style={{ alignItems: 'center' }}>
            <View style={{ position: 'absolute', alignItems: 'center', marginTop: 0.25 * bubbleHeight}}>
              <Bubble width={bubbleHeight} height = {bubbleHeight}/>
              <View style={{ marginTop: '-80%' }}> 
                <Feather name="arrow-left" size={0.6 * bubbleHeight} color="black" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: bubbleHeight, height: bubbleHeight, width: 2.75 * bubbleHeight, marginLeft: -2.75* bubbleHeight,}}>
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
                <TouchableOpacity onPress={toggleSearch} style = {{position: 'absolute', marginLeft: 4.75 * bubbleHeight}}>
                <AntDesign name="check" size={bubbleHeight/2} color="black" />
                </TouchableOpacity>
                <TextInput
                placeholder="Set moment caption:"
                placeholderTextColor="#515f69ff"
                style={{ position:'absolute', marginLeft: 0.25 * bubbleHeight, fontSize: 16, fontFamily: "Jacques Francois"}}
                autoFocus = {false}
                onEndEditing={toggleSearch}
                ref = {textInputRef}
                value = {caption}
                onChangeText = {setCaption}
                />
            </Animated.View>
            <Animated.View style = {{opacity: fadeCaptionButton}}>
               <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => toggleSearch()}>
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                  <Bubble width={1.5*bubbleHeight} height={1.5*bubbleHeight} />
                  <View style={{ marginTop: '-80%' }}>
                    <AntDesign name="comment" size={0.53333* 1.5 * bubbleHeight} color="black" />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
           
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 1.4 * bubbleHeight}} onPress = {pickImage}>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Bubble width={2*bubbleHeight} height={2*bubbleHeight} />
                <View style={{ marginTop:'-80%' }}>
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
                  <Image
                    source={moment.album}
                    style={{ width: '40%', aspectRatio: 1, height: undefined }}
                  />
                  <Image
                    source={vinylImg}
                    style={{ width: '100%', aspectRatio: 1, height: undefined, position: 'absolute' }}
                  />
                </View>
              </View>
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 0.6*bubbleHeight }}>
                  <View style={{ marginLeft: 0.2*bubbleHeight }}>
                  <Text style={{ fontSize: 0.6*bubbleHeight, fontFamily: 'Jacques Francois', color: '#333C42' }}>
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
            onPress={() => scrollFunc(2)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Jacques Francois' }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}