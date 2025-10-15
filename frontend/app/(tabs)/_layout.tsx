import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/_context/AuthContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Stack from '@/assets/other/Stack.svg';
import { RNSVGSvgIOS } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, View, ActivityIndicator } from 'react-native';
import { demoMoment, demoMoments, demoGroups } from '../../components/demoMoment';
import { supabase } from '@/constants/supabase';
import { useFonts } from 'expo-font';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const profilePic = require('../../assets/images/profile.png');
  const { user, session, loading, pfpUrl, setPfpUrl } = useAuth();
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = width * 0.2;



  useEffect(() => {
    if (!user?.id) return;

    const fetchUserInfo = async () => {
      try {
        // Fetch user info from Supabase
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("pfp_url")
          .eq("id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user info:", userError);
          return;
        }

        // Fetch presigned URL if user has a profile image
        if (userData?.pfp_url) {
          try {
            const res = await fetch(
              `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${userData.pfp_url}`
            );
            if (res.ok) {
              const { downloadURL } = await res.json();
              setPfpUrl(downloadURL); // Set global pfpUrl
            } else {
              console.error("Failed to fetch presigned URL:", res.status);
            }
          } catch (err) {
            console.error("Error fetching presigned URL:", err);
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [user?.id]);
  const createPic = require('../../assets/images/createPic.png');

  
  
  

  return (
    <AuthProvider>
      <Tabs
        initialRouteName="profile"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
      >
        <Tabs.Screen
          name="momentEx"
          initialParams={{
            momentInfo: demoMoment
          }}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="house" size={24} color="hsla(0, 0%, 67%, 1.00)" />
            ),
          }}
        />
        <Tabs.Screen
          name="searchPage"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="magnifying-glass" size={24} color="hsla(0, 0%, 67%, 1.00)" />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: ' ',
            tabBarIcon: () => (
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 41 }}>
                <Image source={createPic} style={{ width: 40, height: 40, borderRadius: 50, overflow: 'hidden' }} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="stack"
          initialParams={{ momentInfo: demoMoments }}
          options={{
            title: ' ',
            tabBarIcon: () => (
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
                <RNSVGSvgIOS>
                  <Stack width={40} height={40} />
                </RNSVGSvgIOS>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="dGroup"
          initialParams={{ groupInfo: demoGroups }}
          options={{
            title: 'Dailies',
            tabBarIcon: () => (
              <Ionicons name="people-sharp" size={24} color="hsla(0, 0%, 67%, 1.00)" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: () => (
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end', alignContent: 'center' }}>
                <Image source={profilePic} style={{ width: 30, height: 30, borderRadius: 50, overflow: 'hidden' }} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="testAPIs"
          options={{
            title: 'testAPIs',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.circle.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
