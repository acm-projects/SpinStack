import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';

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
    // You can save this info or navigate to the next page
    // router.push('/nextStep');
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


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <Text style={styles.title2}>Create Your Profile</Text>
          <Text style={styles.title}>Tell us about yourself</Text>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#aaa"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#aaa"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Handle (e.g. @username)"
            placeholderTextColor="#aaa"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Short bio..."
            placeholderTextColor="#aaa"
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
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  title2: {
    color: '#fff',
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 50,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  button: {
    backgroundColor: '#272727',
    borderColor: '#0BFFE3',
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
