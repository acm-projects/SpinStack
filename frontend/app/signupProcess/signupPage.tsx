import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Button, ImageBackground, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/constants/supabase";
import { AuthProvider, useAuth } from "@/_context/AuthContext"; // Adjusted path, update as needed
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';

export default function SignUpPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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


  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace("../(tabs)/profile");
  }, [user]);

  const handleSignUp = async () => {
    Keyboard.dismiss();
    const regexEmail = /^\S+@\S+\.\S+$/;
    const regexPass = /^(?=.*[0-9])(?=.*[A-Z]).{6,}$/;

    if (!regexEmail.test(email)) return Alert.alert("Invalid Email");
    if (!regexPass.test(password)) return Alert.alert("Invalid Password");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert("Signup Error", error.message);

    if (data.user) setUser(data.user);
    Alert.alert("Success", "Check your email to confirm your account.");
    router.replace("../(tabs)/profile"); // redirect to home after signup
  };

  const handleSignIn = async () => {
    Keyboard.dismiss();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return Alert.alert("Sign In Error", error.message);

    if (data.user) setUser(data.user);
    Alert.alert("Welcome back!", `Signed in as ${data.user.email}`);
    router.replace("../(tabs)/profile"); // redirect after login
  };

  return (
    <ImageBackground
      source={require("../../assets/images/signUpBackground.png")} //
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        style={{ flex: 1, }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.titleText}>SpinStack</Text>
            <Text style={styles.baseText}>Getting Started</Text>
            <View style={{ width: "70%", paddingTop: 30 }}>
              <Text style={{ color: "#333C42", paddingBottom: 20, fontFamily: "Jacques Francois", fontSize: 16, textAlign: "center" }}>
                Create a SpinStack account with a username and password
              </Text>
            </View>

            <TextInput
              style={[styles.input, { color: "#333C42", fontFamily: "Jacques Francois", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42", marginTop: 0 }]}
              placeholder="Enter email"
              placeholderTextColor="#333C42"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[styles.input, { color: "#", fontFamily: "Jacques Francois", backgroundColor: "#FFF0E2", borderWidth: 2, borderColor: "#333C42" }]}
              placeholder="Enter password"
              placeholderTextColor="#333C42"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => router.push("./profileSetup")}>
              <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8 }}>
                <Text style={{ flex: 1, color: "white", fontFamily: "Jacques Francois", textAlign: "center", fontSize: 15 }}>Sign Up</Text>

              </View>
            </Pressable>

            <Pressable onPress={handleSignIn}>
              <View style={{ backgroundColor: "#333c42", width: 352, padding: 10, borderRadius: 8, marginTop: 10 }}>
                <Text style={{ color: "white", fontFamily: "Jacques Francois", textAlign: "center", fontSize: 15 }}>Sign In</Text>

              </View>
            </Pressable>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, paddingTop: 75 },
  baseText: { color: "#333C42", paddingBottom: 50, fontFamily: "Jacques Francois", fontSize: 16 },
  titleText: { fontSize: 35, fontFamily: "Luxurious Roman", color: "#333C42", paddingTop: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#333C42", padding: 10, marginBottom: 10, borderRadius: 10 },
});
