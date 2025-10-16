import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';
import * as Font from 'expo-font';

export default function ProfileInfo() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const { user } = useAuth();
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

  if (!fontsLoaded) return null; // prevent rendering before fonts load

  const handleNext = () => {
    console.log('User Info:', { firstName, lastName, handle, bio });
    router.push("../signupProcess/profileImage");
  };

  const verifyInfo = (): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const handleRegex = /^[a-zA-Z0-9._-]+$/;

    if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50 || !nameRegex.test(firstName.trim())) {
      Alert.alert("Error", "First name must be 2-50 characters and only contain letters, spaces, hyphens, apostrophes");
      return false;
    }

    if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 50 || !nameRegex.test(lastName.trim())) {
      Alert.alert("Error", "Last name must be 2-50 characters and only contain letters, spaces, hyphens, apostrophes");
      return false;
    }

    if (!handle || handle.trim().length < 3 || handle.trim().length > 30 || !handleRegex.test(handle.trim()) || /^[._-]|[._-]$/.test(handle.trim())) {
      Alert.alert("Error", "Handle must be 3-30 characters, only letters/numbers/._-, and cannot start or end with special chars");
      return false;
    }

    if (bio && (bio.trim().length < 5 || bio.trim().length > 100)) {
      Alert.alert("Error", "Bio must be 5-100 characters if provided");
      return false;
    }

    return true;
  };

  const setUserInfo = async () => {
    if (!verifyInfo()) return false;

    if (user) {
      const { data, error } = await supabase
        .from("users")
        .update({ username: handle, bio, first_name: firstName, last_name: lastName })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
        return false;
      } else {
        console.log("Successfully updated profile:", data);
        handleNext();
        return true;
      }
    } else {
      Alert.alert("Error", "User not found");
      return false;
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/signUpBackground.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={{ marginBottom: 50, marginLeft: 10 }}>
              <Pressable onPress={() => router.back()}>
                <Image source={require("../../assets/images/backBubble.png")} />
              </Pressable>
            </View>

            <Text style={styles.title2}>Create Your Profile</Text>
            <Text style={styles.title}>Tell us about yourself</Text>

            <TextInput
              style={[styles.input, inputExtraStyle]}
              placeholder="First Name"
              placeholderTextColor="#333C42"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={[styles.input, inputExtraStyle]}
              placeholder="Last Name"
              placeholderTextColor="#333C42"
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={[styles.input, inputExtraStyle]}
              placeholder="Handle (e.g. @username)"
              placeholderTextColor="#333C42"
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, { ...inputExtraStyle, height: 100, textAlignVertical: 'top' }]}
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
    </ImageBackground>
  );
}

const inputExtraStyle = {
  textAlignVertical: 'top' as const,
  color: "#333C42",
  fontFamily: "Jacques Francois",
  backgroundColor: "#FFF0E2",
  borderWidth: 2,
  borderColor: "#333C42",
  marginTop: 0,
  marginHorizontal: 20,
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { color: '#333C42', fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 30, fontFamily: "Jacques Francois" },
  title2: { color: '#333C42', fontSize: 35, fontWeight: '600', textAlign: 'center', marginBottom: 20, marginTop: -50, fontFamily: "Luxurious Roman" },
  input: { backgroundColor: '#FFF0E2', color: '#333C42', padding: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#222', fontFamily: "Jacques Francois" },
  button: { backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8, alignSelf: "center" },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600', fontFamily: "Jacques Francois" },
});
