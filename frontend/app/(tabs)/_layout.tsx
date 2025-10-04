import { Tabs } from 'expo-router';
import  React from 'react';
import { AuthProvider } from '@/_context/AuthContext';
import { Image } from "react-native";
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  
  return (
    <AuthProvider>
      <Tabs initialRouteName="profile"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile ',
            tabBarIcon: ({ size }) => (
              <Image
                source={require("../../assets/images/profile.png")}
                style={{
                  width: size,      // use the provided size so it matches other tabs
                  height: size,
                  borderRadius: size / 2, // makes it circular if it’s a square
                }}
              />
            ),
          }}
          />
        <Tabs.Screen
          name = "moment"
          options = {{
            title: 'Moment',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="circle" color = {color}/>
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
