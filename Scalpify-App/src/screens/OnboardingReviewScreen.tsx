import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, GhostLink, PrimaryButton, SecondaryButton } from '../components/ui';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, spacing } from '../theme';

export default function OnboardingReviewScreen() {
  const nav = useNavigation<any>();
  const { answers, clear } = useOnboarding();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review your answers</Text>
        <Text style={styles.sub}>Check the summary below before submitting.</Text>

        <Card style={styles.sectionCard} glow="primary">
          <Text style={styles.sectionTitle}>General</Text>
          {Object.keys(answers.general || {}).length === 0 ? (
            <Text style={styles.emptyText}>No general answers saved yet.</Text>
          ) : (
            Object.entries(answers.general || {}).map(([k, v]) => (
              <Row key={k} label={k} value={v} />
            ))
          )}
          {answers.followUps?.general && Object.keys(answers.followUps.general).length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>More details</Text>
              {Object.entries(answers.followUps.general).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pre-transplant</Text>
          {Object.keys(answers.pre || {}).length === 0 ? (
            <Text style={styles.emptyText}>No pre-transplant answers saved yet.</Text>
          ) : (
            Object.entries(answers.pre || {}).map(([k, v]) => <Row key={k} label={k} value={v} />)
          )}
          {answers.followUps?.pre && Object.keys(answers.followUps.pre).length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>More details</Text>
              {Object.entries(answers.followUps.pre).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Post-transplant</Text>
          {Object.keys(answers.post || {}).length === 0 ? (
            <Text style={styles.emptyText}>No post-transplant answers saved yet.</Text>
          ) : (
            Object.entries(answers.post || {}).map(([k, v]) => <Row key={k} label={k} value={v} />)
          )}
          {answers.followUps?.post && Object.keys(answers.followUps.post).length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>More details</Text>
              {Object.entries(answers.followUps.post).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          <SecondaryButton label="Edit answers" onPress={() => nav.navigate('OnboardingFlow')} style={styles.actionBtn} />
          <PrimaryButton
            label="Submit and Finish"
            onPress={() => {
              clear();
              // After finishing onboarding, send user to SignUp so they can create an account
              nav.navigate('SignUp' as never);
            }}
            style={styles.actionBtn}
          />
        </View>

        <GhostLink label="Discard and restart" color={colors.textMuted} onPress={() => {
          clear();
          nav.navigate('OnboardingFlow');
        }} underline />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  const text = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  title: { color: colors.textStrong, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: -4 },
  sectionCard: { gap: 10 },
  sectionTitle: { color: colors.textStrong, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  row: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  rowLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize', marginBottom: 4 },
  rowValue: { color: colors.textStrong, fontSize: 14, lineHeight: 20 },
  actions: { gap: 12, marginTop: spacing.xs },
  actionBtn: { width: '100%' },
});
