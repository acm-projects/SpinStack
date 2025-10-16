import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Font from 'expo-font';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';

export default function ProfileInfo() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const { user, session, loading, signingUp, setSigningUp} = useAuth();


  const handleNext = () => {
    console.log('User Info:', { firstName, lastName, handle, bio });
    router.push("../signupProcess/profileImage");

  };

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

  return (
    <ImageBackground
      source={require("../../assets/images/signUpBackground.png")} //
      style={{ flex: 1 }}
      resizeMode="cover"
    >


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={{ marginBottom: 50, marginLeft: 10 }}>
          <Pressable onPress={() => router.back()}>
            <Image
              source={require("../../assets/images/backBubble.png")}
              style={{

              }}
            />

          </Pressable>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>


          <View>
            <Text style={styles.title2}>Create Your Profile</Text>
            <Text style={styles.title}>Tell us about yourself</Text>

            <TextInput
              style={[styles.input, { textAlignVertical: 'top', color: "#333C42", fontFamily: "Jacques Francois", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42", marginTop: 0, marginHorizontal: 20 }]}
              placeholder="First Name"
              placeholderTextColor="#333C42"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={[styles.input, { textAlignVertical: 'top', color: "#333C42", fontFamily: "Jacques Francois", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42", marginTop: 0, marginHorizontal: 20 }]}
              placeholder="Last Name"
              placeholderTextColor="#333C42"
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={[styles.input, { textAlignVertical: 'top', color: "#333C42", fontFamily: "Jacques Francois", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42", marginTop: 0, marginHorizontal: 20 }]}
              placeholder="Handle (e.g. @username)"
              placeholderTextColor="#333C42"
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', color: "#333C42", fontFamily: "Jacques Francois", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42", marginTop: 0, marginHorizontal: 20 }]}
              placeholder="Short bio..."
              placeholderTextColor="#333C42"
              value={bio}
              onChangeText={setBio}
              multiline
            />

            <Pressable style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>


    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#333C42',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: "Jacques Francois"
  },
  title2: {
    color: '#333C42',
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 200,
    marginTop: -50,
    fontFamily: "Luxurious Roman"
  },
  input: {
    backgroundColor: '#FFF0E2',
    color: '#333C42',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,

    borderWidth: 1,
    borderColor: '#222',
    fontFamily: "Jacques Francois"
  },
  button: {
    backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8, alignSelf: "center"
  },
  buttonText: {
    color: '#ffffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "Jacques Francois"
  },
});
