import { Tabs } from 'expo-router';
import  React from 'react';
import { AuthProvider } from '@/_context/AuthContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


import FontAwesome6  from '@expo/vector-icons/FontAwesome6';
import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';
import { demoMoment, demoMoments, demoGroups } from '../../components/demoMoment';
import * as ImageManipulator from 'expo-image-manipulator'

import Bottom from '@/assets/other/Group 9.svg';
import { RNSVGSvgIOS } from 'react-native-svg';
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
            alignItems: 'center',
            gap: 20,
            width: '100%',
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

  return (
    <AuthProvider>
      <Tabs initialRouteName="momentEx"
        tabBar={props => <MyCustomTabBar {...props}/>}
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
            tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={30} color="hsla(0, 0%, 67%, 1.00)" style = {{marginLeft: 6}}/>,
          }}
        />
        <Tabs.Screen
          name="index" 
          options={{
            title: 'Search', 
            tabBarIcon: ({ color }) => <FontAwesome6 name="magnifying-glass" size={30} color="hsla(0, 0%, 67%, 1.00)" />,
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
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Image source = {src} style = {{width: 60, height: 60, marginBottom: 15}}/>
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
            tabBarIcon: ({ color }) => <Ionicons name="people-sharp" size={30} color="hsla(0, 0%, 67%, 1.00)" />
          }}
          />
        <Tabs.Screen
          name = "profile"
          options = {{
            title: 'Profile', 
            tabBarIcon: ({ color }) => 
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignContent: 'center'}}>
              <Image source = {profilePic} style = {[{width: 40, height: 40, borderRadius: 50, overflow: 'hidden', borderWidth: 1, borderColor: 'white', marginRight: 5}]}/>
            </View>
          }}
        />
        {/*
        <Tabs.Screen
          name="testAPIs"
          options={{
            title: 'testAPIs ',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />
          }}
        />*/}
      </Tabs>
    </AuthProvider>

  );
}
