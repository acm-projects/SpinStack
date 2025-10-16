import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/_context/AuthContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';


import FontAwesome6  from '@expo/vector-icons/FontAwesome6';
import Stack from '@/assets/other/Stack.svg';
import { RNSVGSvgIOS } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, View, Text} from 'react-native';
import { demoMoment, demoMoments, demoGroups } from '../../components/demoMoment';
import * as ImageManipulator from 'expo-image-manipulator'

import Bottom from '@/assets/other/Group 9.svg';
import { TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const profilePic = require('../../assets/images/profile.png');
  const src = require('../../assets/images/stack.png');
  const context = ImageManipulator.useImageManipulator('');
  const MyCustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View
        style={{
          width: '100%',
          height: 120,
          position: 'absolute',
          bottom: 0,
          backgroundColor: 'transparent',
          justifyContent: 'flex-end',
        }}
      >
        {/* Background SVG */}
        <RNSVGSvgIOS>
          <Bottom />
        </RNSVGSvgIOS>

        {/* Icons row */}
        <View
          style={{
            position: 'absolute',
            bottom: 25,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            gap: 20,
            width: '100%',
            marginLeft: 20,
            marginBottom: 20,
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

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
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
              <View key={route.key} style={{ alignItems: 'center'}}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  onLongPress={onLongPress}
                >
                  {icon}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  const createPic = require('../../assets/images/createPic.png');

  
  
  
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

  //set fonts
  const [fontsLoaded] = useFonts({
    'Luxurious Roman': require('@/fonts/LuxuriousRoman-Regular.ttf'),
    'Jacques Francois': require('@/fonts/JacquesFrancois-Regular.ttf'),
  });

  if(!fontsLoaded) {
    return (
      <View>
        <Text> hmm the fonts haven't loaded</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Tabs initialRouteName="stack"
        tabBar={props => <MyCustomTabBar {...props}/>}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
      
        <Tabs.Screen
          name="stack"
          initialParams = {{
            momentInfo: demoMoments
          }}
          options={{
            title: ' ',
            tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={30} color="hsla(0, 0%, 67%, 1.00)" style = {{marginLeft: 6}}/>,
          }}
        />
        <Tabs.Screen
          name="searchPage"
          options={{
            title: ' ', 
            tabBarIcon: ({ color }) => <FontAwesome6 name="magnifying-glass" size={30} color="hsla(0, 0%, 67%, 1.00)" />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: ' ',
            tabBarIcon: () => (
              <Image source={createPic} style={{ width: 55, height: 55, borderRadius: 50, overflow: 'hidden' }} />
            ),
          }}
        />
        <Tabs.Screen
          name = "dGroup"
          initialParams = {{
            groupInfo: demoGroups
          }}
          options = {{
            title: ' ',
            tabBarIcon: ({ color }) => <Ionicons name="people-sharp" size={30} color="hsla(0, 0%, 67%, 1.00)" />
          }}
        />
        <Tabs.Screen
          name = "profile"
          options = {{
            title: ' ', 
            tabBarIcon: ({ color }) => 
            <Image source = {profilePic} style = {[{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', borderWidth: 1, borderColor: 'white', marginRight: 5}]}/>
          }}
        />
        {/*
        <Tabs.Screen
          name="testAPIs"
          options={{
            title: 'testAPIs',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.circle.fill" color={color} />
            ),
          }}
        />*/}
      </Tabs>
    </AuthProvider>
  );
}
