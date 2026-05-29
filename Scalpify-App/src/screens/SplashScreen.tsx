import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';
import { useUser } from '../userStore';

const logo = require('../../assets/logo.png');

export default function SplashScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUser();

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const barW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();

    Animated.timing(barW, {
      toValue: 1, duration: 2000, delay: 400,
      easing: Easing.inOut(Easing.ease), useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      nav.reset({ index: 0, routes: [{ name: user ? 'MainTabs' : 'Welcome' }] });
    }, 2600);
    return () => clearTimeout(t);
  }, [user, nav]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgBase} />

      <View style={styles.center}>
        <Animated.Image
          source={logo}
          style={[styles.logo, { opacity: fade, transform: [{ scale }] }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: barW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        </View>
        <Text style={styles.footer}>AI-Powered Hair Loss Assessment</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 220, height: 220 },
  bottom: { paddingHorizontal: 50, paddingBottom: 40 },
  barTrack: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, overflow: 'hidden', marginBottom: 14,
  },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  footer: {
    color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: '600',
    textAlign: 'center', letterSpacing: 0.5,
  },
});
