import { Tabs } from 'expo-router';
import  React from 'react';
import { AuthProvider } from '@/_context/AuthContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


import FontAwesome6  from '@expo/vector-icons/FontAwesome6';
import Stack from '@/assets/other/Stack.svg';
import { RNSVGSvgIOS } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';
import { demoMoment, demoMoments, demoGroups } from '../../components/demoMoment';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const profilePic = require('../../assets/images/profile.png');

  return (
    <AuthProvider>
      <Tabs initialRouteName="profile"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
        >
        <Tabs.Screen
          name="momentEx"
          initialParams = {{
            momentInfo: demoMoment
          }}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={24} color="hsla(0, 0%, 67%, 1.00)" />,
          }}
        />
        <Tabs.Screen
          name="index" 
          options={{
            title: 'Search', 
            tabBarIcon: ({ color }) => <FontAwesome6 name="magnifying-glass" size={24} color="hsla(0, 0%, 67%, 1.00)" />,
          }}
        />

        <Tabs.Screen
          name="stack"
          initialParams = {{
            momentInfo: demoMoments
          }}
          options={{
            title: ' ',
            tabBarIcon: ({ color }) => 
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignContent: 'center'}}>
              <RNSVGSvgIOS><Stack width={40} height={40}/></RNSVGSvgIOS>
            </View>
          }}
        />
        <Tabs.Screen
          name = "dGroup"
          initialParams = {{
            groupInfo: demoGroups
          }}
          options = {{
            title: 'Dailies',
            tabBarIcon: ({ color }) => <Ionicons name="people-sharp" size={24} color="hsla(0, 0%, 67%, 1.00)" />
          }}
          />
        <Tabs.Screen
          name = "profile"
          options = {{
            title: 'Profile', 
            tabBarIcon: ({ color }) => 
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end', alignContent: 'center'}}>
              <Image source = {profilePic} style = {[{width: 30, height: 30, borderRadius: 50, overflow: 'hidden'}]}/>
            </View>
          }}
        />
        <Tabs.Screen
          name="testAPIs"
          options={{
            title: 'testAPIs ',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />
          }}
        />
      </Tabs>
    </AuthProvider>

  );
}
