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

  // --------------- FORCE SIGN-OUT FOR TESTING (Optional - comment out when done testing) ---------------
  /* useEffect(() => {
    const forceLogout = async () => {
      await logout();
    };
    forceLogout();
  }, []); // Empty array means it only runs once on mount
  */

  // --------------- REDIRECT LOGIC ---------------
  useEffect(() => {
    if (loading || checkingProfile) return;
    if(true) {
      router.replace('/(tabs)/profile');
    }else {
      if (!session) {
        router.replace('/signupProcess/signupPage');
      } else if (!profileComplete) {
        router.push('/signupProcess/profileSetup');
      } else {
        router.replace('/(tabs)/profile');
      }
    }
    
  }, [loading, checkingProfile, session, profileComplete]);

  //Loading spinner while AuthContext checks for existing session
  if (loading || checkingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="white" />
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
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootStack />
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}