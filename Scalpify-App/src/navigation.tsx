import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import SplashScreen from './screens/SplashScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import JourneyScreen from './screens/JourneyScreen';
import MedsScreen from './screens/MedsScreen';
import ProfileScreen from './screens/ProfileScreen';
import CameraScreen from './screens/CameraScreen';
import ScanResultsScreen from './screens/ScanResultsScreen';
import NextStepsScreen from './screens/NextStepsScreen';
import NorwoodAnalysisScreen from './screens/NorwoodAnalysisScreen';
import RecoveryCalendarScreen from './screens/RecoveryCalendarScreen';
import { colors } from './theme';

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  Camera: undefined;
  ScanResults: undefined;
  NextSteps: undefined;
  NorwoodAnalysis: undefined;
  RecoveryCalendar: undefined;
};

export type TabParamList = {
  Home: undefined;
  Journey: undefined;
  CameraTab: undefined;
  Meds: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function CameraStub() {
  // Placeholder; tab press is intercepted to navigate to root Camera screen
  return null;
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const rootNav = useNavigation<any>();
  const items: { name: keyof TabParamList; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
    { name: 'Home', icon: 'home-outline', label: 'Home' },
    { name: 'Journey', icon: 'stats-chart-outline', label: 'Journey' },
    { name: 'CameraTab', icon: 'camera', label: '' },
    { name: 'Meds', icon: 'medical-outline', label: 'Meds' },
    { name: 'Profile', icon: 'person-outline', label: 'Profile' },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.tabSafeArea}>
      <View style={styles.tabBar}>
        {items.map((item, i) => {
          const focused = state.index === i;
          const isCamera = item.name === 'CameraTab';

          if (isCamera) {
            return (
              <Pressable
                key={item.name}
                onPress={() => rootNav.navigate('Camera')}
                style={styles.fabWrap}
                hitSlop={8}
              >
                <View style={styles.fab}>
                  <Ionicons name="camera" size={26} color="#001712" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              style={styles.tabBtn}
              hitSlop={4}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={focused ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabLabel, focused && { color: colors.primary }]}>
                {item.label}
              </Text>
              {focused && <View style={styles.tabDot} />}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="CameraTab" component={CameraStub} />
      <Tab.Screen name="Meds" component={MedsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.bg,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.orange,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="ScanResults" component={ScanResultsScreen} />
        <Stack.Screen name="NextSteps" component={NextStepsScreen} />
        <Stack.Screen
          name="NorwoodAnalysis"
          component={NorwoodAnalysisScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="RecoveryCalendar" component={RecoveryCalendarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabSafeArea: { backgroundColor: colors.bg },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
    minHeight: 62,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 10, color: colors.textMuted },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  fabWrap: { flex: 1, alignItems: 'center', marginTop: -22 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 4,
    borderColor: colors.bg,
  },
});
