import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';


export default function ProfileInfo() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const handleNext = () => {
    console.log('User Info:', { firstName, lastName, handle, bio });
    router.push("../signupProcess/profileImage");
    // You can save this info or navigate to the next page
    // router.push('/nextStep');
  };

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

          <Pressable style={styles.button} onPress={handleNext}>
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
