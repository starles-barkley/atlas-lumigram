import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LogoutComponent } from '@/components/LogoutComponent';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerRight: () => <LogoutComponent />,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) =>
          <Ionicons
              name={focused ? "search" : "search-outline"}
              size={28}
              color={focused ? Colors.light.tint : Colors.light.icon}
          />
        }}
      />
      <Tabs.Screen
        name="add-post"
        options={{
          title: 'Add Post',
          tabBarIcon: ({ focused }) =>
          <Ionicons
              name={focused ? "add" : "add-outline"}
              size={28}
              color={focused ? Colors.light.tint : Colors.light.icon}
          />
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ focused }) =>
          <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={28}
              color={focused ? Colors.light.tint : Colors.light.icon}
          />
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ focused }) =>
          <Ionicons
              name={focused ? "person" : "person-outline"}
              size={28}
              color={focused ? Colors.light.tint : Colors.light.icon}
          />
        }}
      />
      <Tabs.Screen
        name="profile/[id]"
        options={{
          title: 'My Profile',
          href: null,
        }}
        />
    </Tabs>
  );
}
