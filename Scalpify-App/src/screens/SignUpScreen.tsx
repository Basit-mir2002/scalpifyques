import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Field, PrimaryButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';
import { signUp } from '../userStore';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function SignUpScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Missing name', 'Please enter your full name.');
    if (!email.trim()) return Alert.alert('Missing email', 'Please enter your email.');
    if (password.length < 6) return Alert.alert('Weak password', 'Use at least 6 characters.');
    if (surgeryDate && !ISO_DATE_RE.test(surgeryDate.trim())) {
      return Alert.alert('Invalid date', 'Use YYYY-MM-DD format, e.g. 2025-03-15.');
    }
    setSubmitting(true);
    try {
      await signUp({ fullName: name, email, surgeryDate: surgeryDate || null });
      nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      Alert.alert('Sign-up failed', e?.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start tracking your recovery journey with AI precision
          </Text>
        </View>

        <Field label="Full name" placeholder="e.g. Ahmed Hassan" value={name} onChangeText={setName} />
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

        <Field
          label="Surgery date (optional)"
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
          iconRight="calendar-outline"
          value={surgeryDate}
          onChangeText={setSurgeryDate}
        />

        <Pressable
          onPress={() => setAgreed(!agreed)}
          style={({ pressed }) => [
            styles.consent,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
            {agreed && <Ionicons name="checkmark" size={14} color="#000" />}
          </View>
          <Text style={styles.consentText}>
            I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>, and consent to HIPAA-compliant data
            processing
          </Text>
        </Pressable>

        <PrimaryButton
          label="Create Account"
          disabled={!agreed || submitting}
          loading={submitting}
          onPress={handleCreate}
        />

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
          <Text style={styles.footerText}>256-bit encryption · HIPAA-compliant storage</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6, lineHeight: 22 },
  consent: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  consentText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  link: { color: colors.primary },
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
  },
  footerText: { color: colors.textMuted, fontSize: 12 },
});
