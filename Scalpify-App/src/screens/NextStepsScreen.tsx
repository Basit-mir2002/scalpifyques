import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CircleIconButton, Pill, PrimaryButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { useLatestScanFull } from '../scanStore';
import { doctor } from '../data';
import type { RootStackParamList } from '../navigation';

type Action = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  cta: string;
};

const ACTIONS: Action[] = [
  {
    id: 'consult',
    icon: 'medkit-outline',
    iconColor: colors.primary,
    iconBg: 'rgba(46,230,200,0.12)',
    title: `Discuss with ${doctor.name}`,
    body: `${doctor.role} · Next consult ${doctor.nextConsult}`,
    cta: 'Send projection',
  },
  {
    id: 'plan',
    icon: 'calendar-outline',
    iconColor: colors.purple,
    iconBg: 'rgba(139,92,246,0.15)',
    title: 'Add to recovery plan',
    body: 'Save this projection to your recovery timeline and track real progress against it.',
    cta: 'Save plan',
  },
  {
    id: 'reminders',
    icon: 'notifications-outline',
    iconColor: colors.orange,
    iconBg: 'rgba(249,115,22,0.15)',
    title: 'Schedule weekly scans',
    body: 'Get a reminder every Saturday morning to capture a follow-up scan in the same lighting.',
    cta: 'Turn on',
  },
  {
    id: 'share',
    icon: 'share-outline',
    iconColor: '#22C55E',
    iconBg: 'rgba(34,197,94,0.15)',
    title: 'Share with family',
    body: 'Send the projection to a partner or family member so they can encourage you.',
    cta: 'Share',
  },
];

export default function NextStepsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scan = useLatestScanFull();
  const projection =
    scan?.data.classification.norwood_scale &&
    scan.data.classification.norwood_scale !== 'I'
      ? `Projected to ${stepDownNorwood(scan.data.classification.norwood_scale)}`
      : 'Projected mature density at 8 months';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
        <Text style={styles.headerTitle}>What's Next</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40, gap: spacing.lg }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={28} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Your 8-month preview is ready</Text>
          <Text style={styles.heroBody}>
            Save it, share it with your surgeon, and track real-world progress against the AI
            projection.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Pill label={projection} variant="teal" />
            <Pill label="6-stage timeline" variant="purple" />
          </View>
        </View>

        {/* Actions */}
        <Text style={styles.sectionLabel}>RECOMMENDED ACTIONS</Text>
        <View style={{ gap: 10 }}>
          {ACTIONS.map(a => (
            <View key={a.id} style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: a.iconBg }]}>
                <Ionicons name={a.icon} size={20} color={a.iconColor} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.actionBody}>{a.body}</Text>
              </View>
              <Pressable style={[styles.actionCta, { borderColor: a.iconColor }]}>
                <Text style={[styles.actionCtaText, { color: a.iconColor }]}>{a.cta}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <PrimaryButton
          label="Done"
          onPress={() => nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function stepDownNorwood(n: string): string {
  const u = n.toUpperCase().trim();
  if (u === 'III') return 'Norwood II-III';
  if (u === 'IV') return 'Norwood III';
  if (u === 'V') return 'Norwood IV';
  if (u === 'VI') return 'Norwood V';
  if (u === 'VII') return 'Norwood VI';
  return `Norwood ${u}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  hero: {
    alignItems: 'center',
    backgroundColor: 'rgba(46,230,200,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,230,200,0.3)',
    padding: spacing.xl,
    gap: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(46,230,200,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  heroBody: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  actionBody: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  actionCta: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionCtaText: { fontSize: 12, fontWeight: '600' },
});
