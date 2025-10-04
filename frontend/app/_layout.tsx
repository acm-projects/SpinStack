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

export const unstable_settings = {  initialRouteName: 'signupProcess/signupPage' };

function RootStack() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, isLoading, setUser } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // --------------- FORCE SIGN-OUT FOR TESTING ---------------
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      setUser(null);    // ensure context is cleared
      setIsReady(true); // mark ready after sign out
    });
  }, []);

  // --------------- REDIRECT LOGIC ---------------
  /* useEffect(() => {
    if (isReady && !isLoading) {
      if (!user) {
        router.replace('/signupProcess/signupPage'); // Not logged in → signup
      } else {
        router.replace('/(tabs)/home'); // Logged in → home
      }
    }
  }, [isReady, isLoading, user]);
  */

  // --------------- LOADING SPINNER ---------------
  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    
    <Stack>
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
    </Stack>
  );
}

 




export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootStack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
