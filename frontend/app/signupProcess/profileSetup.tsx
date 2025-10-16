import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';
import * as Font from 'expo-font';
import OpeningSplash from '../../assets/other/openingSplash.svg';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';

export default function ProfileInfo() {
  const router = useRouter();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
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

  if (!fontsLoaded) return null;

  const handleNext = () => {
    console.log('User Info:', { firstName, lastName, handle, bio });
    router.push('../signupProcess/profileImage');
  };

  const verifyInfo = (): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const handleRegex = /^[a-zA-Z0-9._-]+$/;

    if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50 || !nameRegex.test(firstName.trim())) {
      Alert.alert('Error', 'First name must be 2-50 characters and only contain letters, spaces, hyphens, apostrophes');
      return false;
    }

    if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 50 || !nameRegex.test(lastName.trim())) {
      Alert.alert('Error', 'Last name must be 2-50 characters and only contain letters, spaces, hyphens, apostrophes');
      return false;
    }

    if (
      !handle ||
      handle.trim().length < 3 ||
      handle.trim().length > 30 ||
      !handleRegex.test(handle.trim()) ||
      /^[._-]|[._-]$/.test(handle.trim())
    ) {
      Alert.alert(
        'Error',
        'Handle must be 3-30 characters, only letters/numbers/._-, and cannot start or end with special chars'
      );
      return false;
    }

    if (bio && (bio.trim().length < 5 || bio.trim().length > 100)) {
      Alert.alert('Error', 'Bio must be 5-100 characters if provided');
      return false;
    }

    return true;
  };

  const setUserInfo = async () => {
    if (!verifyInfo()) return false;

    if (user) {
      const { data, error } = await supabase
        .from('users')
        .update({
          username: handle,
          bio,
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return false;
      } else {
        console.log('Successfully updated profile:', data);
        handleNext();
        return true;
      }
    } else {
      Alert.alert('Error', 'User not found');
      return false;
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      {/* Background */}
      <View
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#FFF0E2',
        }}
      >
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* Back Button */}
            <View style={{ marginBottom: 50, marginLeft: 10 }}>
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

            {/* Titles */}
            <Text style={styles.title2}>Create Your Profile</Text>
            <Text style={styles.title}>Tell us about yourself</Text>

            {/* Inputs */}
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

            {/* Button */}
            <Pressable style={styles.button} onPress={setUserInfo}>
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const inputExtraStyle = {
  textAlignVertical: 'top' as const,
  color: '#333C42',
  fontFamily: 'Jacques Francois',
  backgroundColor: '#FFF0E2',
  borderWidth: 2,
  borderColor: '#333C42',
  marginTop: 0,
  marginHorizontal: 20,
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: {
    color: '#333C42',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Jacques Francois',
  },
  title2: {
    color: '#333C42',
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -50,
    fontFamily: 'Luxurious Roman',
  },
  input: {
    backgroundColor: '#FFF0E2',
    color: '#333C42',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
    fontFamily: 'Jacques Francois',
  },
  button: {
    backgroundColor: '#333c42',
    width: 352,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Jacques Francois',
  },
});
