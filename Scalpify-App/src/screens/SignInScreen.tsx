import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Field, GhostLink, PrimaryButton, CircleIconButton } from '../components/ui';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';
import { signIn } from '../userStore';

export default function SignInScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      return Alert.alert('Missing fields', 'Enter your email and password.');
    }
    setSubmitting(true);
    try {
      const user = await signIn(email);
      if (!user) {
        Alert.alert('Account not found', 'No local account matches that email. Create one first.');
        return;
      }
      nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
      </View>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xl, flex: 1 }}>
        <View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your recovery journey</Text>
        </View>

        <Field
          label="Email"
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          iconRight="mail-outline"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          iconRight="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
        />

        <View style={{ alignItems: 'flex-end', marginTop: -spacing.sm }}>
          <GhostLink label="Forgot password?" color={colors.primary} />
        </View>

        <PrimaryButton
          label="Sign In"
          loading={submitting}
          disabled={submitting}
          onPress={handleSignIn}
        />
      </View>

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
        <Text style={styles.footerText}>HIPAA-compliant · End-to-end encrypted</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6 },
  footer: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: spacing.lg,
  },
  footerText: { color: colors.textMuted, fontSize: 12 },
});
