import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, ActivityIndicator, TouchableWithoutFeedback, View, Button, ImageBackground, Pressable, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/constants/supabase";
import { AuthProvider, useAuth } from "@/_context/AuthContext"; // Adjusted path, update as needed
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import OpeningSplash from '../../assets/other/openingSplash.svg';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signingUp, setSigningUp } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false); // Add this flag

  const { session, loading } = useAuth();
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


  useEffect(() => {
    if (loading) return;

    // Only redirect if we're not actively signing in/up
    if (session && !signingUp && !isSigningIn) {
      router.replace("/(tabs)/profile");
    }
  }, [session, loading, signingUp, isSigningIn]);

  const handleSignUp = async () => {
    Keyboard.dismiss();

    const regexEmail = /^\S+@\S+\.\S+$/;
    const regexPass = /^(?=.*[0-9])(?=.*[A-Z]).{6,}$/;

    if (!regexEmail.test(email)) {
      return Alert.alert("Invalid Email", "Please enter a valid email address.");
    }

    if (!regexPass.test(password)) {
      return Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters with 1 number and 1 uppercase letter."
      );
    }


    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Signup Error", error.message);
        setSigningUp(false); // Only set to false on error
        return;
      }

      setSigningUp(true);
      Alert.alert("Success", "Account created! Welcome!");
      router.push("/signupProcess/profileSetup");

    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setSigningUp(false);
    }
  };

  const handleSignIn = async () => {
    Keyboard.dismiss();
    setIsSigningIn(true); // Set flag before signing in
    setSigningUp(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        Alert.alert("Sign In Error", error.message);
        setIsSigningIn(false);
        return;
      }

      console.log("Signed in");
      Alert.alert("Welcome back!", `Signed in as ${data.user?.email}`);
      // Let layout.tsx handle the redirect

    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsSigningIn(false);
      setSigningUp(true);
    }
  };

  // Show loading while checking if user is already logged in
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#0BFFE3" />
      </View>
    );
  }
  const { width, height } = useWindowDimensions();

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      <View
        style={{
          flex: 1,
          position: 'absolute',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: "#FFF0E2",
        }}
      >
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1, }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.titleText}>SpinStack</Text>
            <Text style={styles.baseText}>Getting Started</Text>
            <View style={{ width: "70%", paddingTop: 30 }}>
              <Text style={{ color: "#333C42", paddingBottom: 20, fontFamily: "Lato", fontSize: 16, textAlign: "center" }}>
                Create a SpinStack account with a username and password
              </Text>
            </View>

            <TextInput
              style={[styles.input, { color: "#333C42", fontFamily: "Lato", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42", marginTop: 0 }]}
              placeholder="Enter email"
              placeholderTextColor="#333C42"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[styles.input, { color: "#", fontFamily: "Lato", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42" }]}
              placeholder="Enter password"
              placeholderTextColor="#333C42"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={handleSignUp}>
              <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8 }}>
                <Text style={{ flex: 1, color: "white", fontFamily: "Lato", textAlign: "center", fontSize: 15 }}>Sign Up</Text>

              </View>
            </Pressable>

            <Pressable onPress={handleSignIn}>
              <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8, marginTop: 10 }}>
                <Text style={{ color: "white", fontFamily: "Lato", textAlign: "center", fontSize: 15 }}>Sign In</Text>

              </View>
            </Pressable>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, paddingTop: 75 },
  baseText: { color: "#333C42", paddingBottom: 50, fontFamily: "Lato", fontSize: 16 },
  titleText: { fontSize: 35, fontFamily: "Lato", color: "#333C42", paddingTop: 20, fontWeight: 700 },
  input: { width: "100%", borderWidth: 1, borderColor: "#333C42", padding: 10, marginBottom: 10, borderRadius: 10 },
});