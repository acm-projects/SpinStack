import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';
import * as Font from 'expo-font';

export default function ProfileInfo() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const { user, session, loading, signingUp, setSigningUp } = useAuth();


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

  const verifyInfo = (): boolean => {
    // Verify first name
    if (!firstName || firstName.trim().length === 0) {
      Alert.alert("Error", "First name is required");
      return false;
    }

    if (firstName.trim().length < 2) {
      Alert.alert("Error", "First name must be at least 2 characters");
      return false;
    }

    if (firstName.trim().length > 50) {
      Alert.alert("Error", "First name must be less than 50 characters");
      return false;
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(firstName.trim())) {
      Alert.alert("Error", "First name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }

    // Verify last name
    if (!lastName || lastName.trim().length === 0) {
      Alert.alert("Error", "Last name is required");
      return false;
    }

    if (lastName.trim().length < 2) {
      Alert.alert("Error", "Last name must be at least 2 characters");
      return false;
    }

    if (lastName.trim().length > 50) {
      Alert.alert("Error", "Last name must be less than 50 characters");
      return false;
    }

    if (!nameRegex.test(lastName.trim())) {
      Alert.alert("Error", "Last name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }

    // Verify handle (username)
    if (!handle || handle.trim().length === 0) {
      Alert.alert("Error", "Username is required");
      return false;
    }

    if (handle.trim().length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return false;
    }

    if (handle.trim().length > 30) {
      Alert.alert("Error", "Username must be less than 30 characters");
      return false;
    }

    // Username: letters, numbers, underscores, periods, hyphens only
    const handleRegex = /^[a-zA-Z0-9._-]+$/;
    if (!handleRegex.test(handle.trim())) {
      Alert.alert("Error", "Username can only contain letters, numbers, dots, underscores, and hyphens");
      return false;
    }

    // Username can't start or end with special characters
    if (/^[._-]|[._-]$/.test(handle.trim())) {
      Alert.alert("Error", "Username cannot start or end with special characters");
      return false;
    }

    // Verify bio (optional, but validate if provided)
    if (bio && bio.trim().length > 0) {
      if (bio.trim().length > 100) {
        Alert.alert("Error", "Bio must be less than 100 characters");
        return false;
      }

      // Bio can contain most characters, but prevent excessive special chars
      if (bio.trim().length < 5) {
        Alert.alert("Error", "Bio must be at least 5 characters if provided");
        return false;
      }
    }

    // All validations passed
    return true;
  };


  const setUserInfo = async () => {
    // Set username and bio
    if (verifyInfo()) {
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .update({
            username: handle,      // Pass an object with key-value pairs
            bio: bio,
            first_name: firstName,
            last_name: lastName
          })
          .eq("id", user.id)
          .select()                // Add .select() to return updated data
          .single();               // Use .single() instead of .maybeSingle()

        if (userError) {
          console.error("Error setting user info:", userError);
          Alert.alert("Error", "Failed to update profile. Please try again.");
          return false;
        } else {
          console.log("Successfully updated profile:", userData);
          handleNext();
          return true;
        }
      } else {
        Alert.alert("Error", "User not found");
        return false;
      }
    }
    return false;
  }


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

          <Pressable style={styles.button} onPress={setUserInfo}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
