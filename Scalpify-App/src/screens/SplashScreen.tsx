import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GhostLink, Pill, PrimaryButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';
import { useUser } from '../userStore';

export default function SplashScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUser();

  useEffect(() => {
    if (user) nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [user, nav]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.logoBox}>
          <Ionicons name="pulse" size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>Scalpify</Text>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Pill label="Clinical-grade · AI-powered" variant="teal" />
        </View>
        <Text style={styles.copy}>
          Track your hair transplant recovery with clinical-precision AI.
          Evidence-based insights built for real outcomes.
        </Text>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Pill label="12,000+ patients · HIPAA-aligned" icon="shield-checkmark-outline" />
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg }}>
        <PrimaryButton label="Get Started Free" onPress={() => nav.navigate('SignUp')} />
        <View style={{ alignItems: 'center' }}>
          <GhostLink
            label="I already have an account"
            underline
            color={colors.text}
            onPress={() => nav.navigate('SignIn')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(46,230,200,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(46,230,200,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  title: { color: colors.text, fontSize: 40, fontWeight: '800', marginTop: 24 },
  copy: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 22,
    lineHeight: 22,
  },
});
