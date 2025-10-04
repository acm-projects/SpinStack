import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Button } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/constants/supabase";
import { AuthProvider, useAuth } from "@/_context/AuthContext"; // Adjusted path, update as needed

import { useRouter } from 'expo-router';

export default function SignUpPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          />
          <TextInput
            style={[styles.input, { color: "white" }]}
            placeholder="Enter password"
            placeholderTextColor="#D2D4C8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Sign Up" onPress={() => router.push("./profileSetup")} />
          <Text style={styles.baseText}> or </Text>
          <Button title="Sign In" onPress={handleSignIn} />
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
