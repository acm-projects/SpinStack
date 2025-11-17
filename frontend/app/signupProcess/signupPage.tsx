import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  View,
  Pressable,
  Animated,
  useWindowDimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/_context/AuthContext";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import OpeningSplash from "../../assets/other/openingSplash.svg";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signingUp, setSigningUp, session, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 🔹 Continuous pulsing animations for both buttons
  const signUpPulseAnim = useRef(new Animated.Value(1)).current;
  const signInPulseAnim = useRef(new Animated.Value(1)).current;

  const { width, height } = useWindowDimensions();

  const loadFonts = async () => {
    await Font.loadAsync({
      "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
      "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
      Lato: require("@/fonts/Lato-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded]);

  // 🔹 Start continuous pulsing animations
  useEffect(() => {
    const createPulse = (animRef: Animated.Value) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRef, {
            toValue: 1.03,
            duration: 1000,
            easing: Animated.Easing?.inOut?.(Animated.Easing.sin) || undefined,
            useNativeDriver: true,
          }),
          Animated.timing(animRef, {
            toValue: 1,
            duration: 800,
            easing: Animated.Easing?.inOut?.(Animated.Easing.sin) || undefined,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createPulse(signUpPulseAnim);
    createPulse(signInPulseAnim);
  }, []);

  useEffect(() => {
    if (loading) return;
    // if (session && !signingUp && !isSigningIn) {
    //   router.replace("/(tabs)/profile");
    // }
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert("Signup Error", error.message);
        setSigningUp(false);
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
    setIsSigningIn(true);
    setSigningUp(false);
    router.push("/signupProcess/spotifyConnect");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert("Sign In Error", error.message);
        setIsSigningIn(false);
        return;
      }

      //Alert.alert("Welcome back!", `Signed in as ${data.user?.email}`);
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsSigningIn(false);
      setSigningUp(true);
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#0BFFE3" />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      <View
        style={{
          flex: 1,
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "#FFF0E2",
        }}
      >
        <OpeningSplash width="100%" height="100%" style={{ marginTop: -30 }} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.titleText}>SpinStack</Text>
            <Text style={styles.baseText}>Getting Started</Text>

            <View style={{ width: "70%", paddingTop: 30 }}>
              <Text
                style={{
                  color: "#333C42",
                  paddingBottom: 20,
                  fontFamily: "Lato",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Create a SpinStack account with a username and password
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  color: "#333C42",
                  fontFamily: "Lato",
                  backgroundColor: "#FFF0E2",
                  borderWidth: 2,
                  borderColor: "#333C42",
                },
              ]}
              placeholder="Enter email"
              placeholderTextColor="#333C42"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[
                styles.input,
                {
                  fontFamily: "Lato",
                  backgroundColor: "#FFF0E2",
                  borderWidth: 2,
                  borderColor: "#333C42",
                },
              ]}
              placeholder="Enter password"
              placeholderTextColor="#333C42"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* 🔹 Pulsing Sign Up Button */}
            <Pressable onPress={handleSignUp}>
              <Animated.View
                style={{
                  transform: [{ scale: signUpPulseAnim }],
                }}
              >
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </View>
              </Animated.View>
            </Pressable>

            {/* 🔹 Pulsing Sign In Button */}
            <Pressable onPress={handleSignIn}>
              <Animated.View
                style={{
                  transform: [{ scale: signInPulseAnim }],
                  marginTop: 10,
                }}
              >
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, paddingTop: 75 },
  baseText: {
    color: "#333C42",
    paddingBottom: 50,
    fontFamily: "Lato",
    fontSize: 16,
  },
  titleText: {
    fontSize: 35,
    fontFamily: "Lato",
    color: "#333C42",
    paddingTop: 20,
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#333c42",
    width: 352,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    flex: 1,
    color: "white",
    fontFamily: "Lato",
    textAlign: "center",
    fontSize: 15,
  },
});
