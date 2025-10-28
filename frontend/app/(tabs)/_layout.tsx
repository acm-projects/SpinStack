import { Tabs } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from '@/_context/AuthContext';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { View, Dimensions, Image, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import { demoMoments, demoGroups } from '../../components/demoMoment';
import Bottom from '@/assets/other/Group 9.svg';
import { supabase } from '@/constants/supabase';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';


const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

import { useTabBar } from './profile/tabBarContext';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const profilePic = require('../../assets/images/profile.png');
  const createPic = require('../../assets/images/stack.png');
  const { width } = Dimensions.get('window');
  const IMAGE_SIZE = width * 0.2;
  const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

  const { user, pfpUrl, setPfpUrl } = useAuth();

  const {tabHeight, setTabHeight} = useTabBar();

  const ICON_SIZE = useMemo(() => tabHeight * 0.29|| 24, [tabHeight]);
  const PROFILE_SIZE = useMemo(() => tabHeight * 0.33 || 28, [tabHeight]);

  // ---------------- Fetch user profile pic ----------------
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserInfo = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('pfp_url')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user info:', userError);
          return;
        }

        if (userData?.pfp_url) {
          const res = await fetch(
            `${nUrl}/api/upload/download-url/${userData.pfp_url}`
          );
          if (res.ok) {
            const { downloadURL } = await res.json();
            setPfpUrl(downloadURL);
          } else {
            console.error('Failed to fetch presigned URL:', res.status);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching user info:', err);
      }
    };

    fetchUserInfo();
  }, [user?.id]);

  // ---------------- Fonts ----------------
  const [fontsLoaded] = useFonts({
    'Luxurious Roman': require('@/fonts/LuxuriousRoman-Regular.ttf'),
    'Jacques Francois': require('@/fonts/JacquesFrancois-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  // ---------------- le Custom Tab Bar ----------------
  const MyCustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    return (
      <View
        style={{
          width: '100%',
          aspectRatio: 3.62344538,
          position: 'absolute',
          left: 0,
          bottom: -8,
          right: 0,
          backgroundColor: 'transparent',
          justifyContent: 'flex-end',
          //borderWidth: 3,
        }}
        onLayout={(e) => {
          const layoutHeight = e.nativeEvent.layout.height;
          if (layoutHeight > 0 && tabHeight !== layoutHeight) {
            setTabHeight(layoutHeight);
          }
        }}
      >
        <Bottom width="100%" height="100%" />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            width: '100%',
            gap: ICON_SIZE,
            marginLeft: ICON_SIZE,
            marginBottom: ICON_SIZE,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const color = isFocused ? 'white' : 'hsla(0, 0%, 67%, 1.00)';
            const icon =
              options.tabBarIcon &&
              options.tabBarIcon({
                focused: isFocused,
                color,
                size: 30,
              });

            return (
              <View key={route.key} style={{ justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity onPress={onPress}>{icon}</TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ---------------- Tabs ----------------
  return (
    <AuthProvider>
      <Tabs
        initialRouteName="stack"
        tabBar={(props) => <MyCustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >

        <Tabs.Screen
          name="home2"
          initialParams={{ momentInfo: demoMoments }}
          options={{
            title: ' ',
            tabBarIcon: ({ color }) => (
              <FontAwesome6
                name="house"
                size = {ICON_SIZE}
                color="hsla(0, 0%, 67%, 1.00)"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="searchPage"
          options={{
            title: ' ',
            tabBarIcon: ({ color }) => (
              <FontAwesome6
                name="magnifying-glass"
                size = {ICON_SIZE}
                color="hsla(0, 0%, 67%, 1.00)"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: ' ',
            tabBarIcon: () => (
              <Image
                source={createPic}
                style={{
                  width: 1.9*ICON_SIZE,
                  height: 1.9*ICON_SIZE,
                  borderRadius: 50,
                }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="dGroup"
          initialParams={{ groupInfo: demoGroups }}
          options={{
            title: ' ',
            tabBarIcon: ({ color }) => (
              <View>
                <Ionicons
                  name="people-sharp"
                  size = {ICON_SIZE}
                  color="hsla(0, 0%, 67%, 1.00)"
                />
              </View>

            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: ' ',
            tabBarIcon: ({ color }) => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={pfpUrl ? { uri: pfpUrl } : require("../../assets/images/profile.png")}
                  style={{
                    width: PROFILE_SIZE,
                    height: PROFILE_SIZE,
                    borderRadius: PROFILE_SIZE/2,
                    borderWidth: 1,
                    borderColor: 'white',
                    resizeMode: 'cover',
                  }}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}