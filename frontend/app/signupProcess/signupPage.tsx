import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Button, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/_context/AuthContext";
import { useRouter } from 'expo-router';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  // ✅ CORRECT: Call useAuth at the top level of the component
  const { session, loading } = useAuth();

  // Check if user is already logged in and redirect
  useEffect(() => {
    // Wait for auth to finish loading (checking AsyncStorage)
    if (loading) return;

    // If session exists, user is already logged in - redirect to profile
    if (session) {
      router.replace("/(tabs)/profile");
    }
  }, [session, loading]); // Re-run when session or loading changes

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

    setSigningUp(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Signup Error", error.message);
        return;
      }

      Alert.alert("Success", "Account created! Welcome!");
      router.replace("/(tabs)/profile");

    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSigningUp(false);
    }
  };

  const handleSignIn = async () => {
    Keyboard.dismiss();

    setSigningUp(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        Alert.alert("Sign In Error", error.message);
        return;
      }

      Alert.alert("Welcome back!", `Signed in as ${data.user?.email}`);
      router.replace("/(tabs)/profile");

    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSigningUp(false);
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

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#000000ff" }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.titleText}>SpinStack</Text>
          <Text style={styles.baseText}>Create account below</Text>
          <TextInput
            style={[styles.input, { color: "white" }]}
            placeholder="Enter email"
            placeholderTextColor="#D2D4C8"
            value={email}
            onChangeText={setEmail}
            editable={!signingUp}
          />
          <TextInput
            style={[styles.input, { color: "white" }]}
            placeholder="Enter password"
            placeholderTextColor="#D2D4C8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!signingUp}
          />
          <Button
            title={signingUp ? "Loading..." : "Sign Up"}
            onPress={handleSignUp}
            disabled={signingUp}
          />
          <Text style={styles.baseText}> or </Text>
          <Button
            title={signingUp ? "Loading..." : "Sign In"}
            onPress={handleSignIn}
            disabled={signingUp}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, paddingTop: 75 },
  baseText: { color: "white", padding: 10 },
  titleText: { fontSize: 35, fontWeight: "bold", color: "#0BFFE3", padding: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "gray", padding: 10, marginBottom: 10, borderRadius: 5 },
});