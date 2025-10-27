import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from 'react-native-vector-icons/Feather';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../_context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/constants/supabase';
import { useFonts } from "expo-font";
import React from 'react';
export const unstable_settings = { initialRouteName: 'signupProcess/signupPage' };

function RootStack() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { session, loading, profileComplete, checkingProfile } = useAuth(); // Added 'loading' from AuthContext
  const [initialLoading, setInitialLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
    "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
  });

  useEffect(() => {
    // Minimum delay to avoid flash
    const timer = setTimeout(() => setInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || checkingProfile || initialLoading || !fontsLoaded) return;

    if (!session) {
      router.replace('/signupProcess/signupPage');
    } else if (!profileComplete) {
      router.replace('/signupProcess/profileSetup');
    } else {
      router.replace('/(tabs)/profile');
    }
  }, [loading, checkingProfile, initialLoading, session, profileComplete, fontsLoaded]);

  // Show loading until both auth state and fonts are ready
  if (loading || checkingProfile || initialLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffffff' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }


  return (

    <Stack screenOptions={{ headerShown: false }}>
      {/* Signup Page */}
      <Stack.Screen
        name="signupProcess/signupPage"
        options={{ headerShown: false }}
      />

      {/* Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Modal */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

      {/* Profile Settings */}
      <Stack.Screen
        name="profileSettings"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="arrow-left" size={30} color="white" />
              <Text style={{ fontSize: 16, color: colorScheme === 'dark' ? 'white' : 'black' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="signupProcess/profileSetup"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "rgba(255, 255, 255, 1)" },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="arrow-left" size={30} color="white" />
              <Text style={{ fontSize: 16, color: colorScheme === 'dark' ? 'white' : 'black' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="signupProcess/profileImage"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="arrow-left" size={30} color="white" />
              <Text style={{ fontSize: 16, color: colorScheme === 'dark' ? 'white' : 'black' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="signupProcess/spotifyConnect"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="arrow-left" size={30} color="white" />
              <Text style={{ fontSize: 16, color: colorScheme === 'dark' ? 'white' : 'black' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />


      <Stack.Screen
        name="createProcess/momentSelect"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="arrow-left" size={30} color="white" />
              <Text style={{ fontSize: 16, color: colorScheme === 'dark' ? 'white' : 'black' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />


      <Stack.Screen
        name="createProcess/momentCut"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="arrow-left" size={30} color="white" />
              <Text style={{ fontSize: 16, color: colorScheme === 'dark' ? 'white' : 'black' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="home2"
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#FFF0E2' : '#FFF0E2' },
          contentStyle: { backgroundColor: '#FFF0E2' }
        }}
      />
    </Stack>


  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <RootStack />
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}