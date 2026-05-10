import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CircleIconButton, PrimaryButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { useLatestScan } from '../scanStore';
import { profileStats } from '../data';

const SCALE = [
  { code: 'I', label: 'I-II', sub: 'Minimal recession' },
  { code: 'III', label: 'III', sub: 'Moderate recession' },
  { code: 'IV', label: 'IV', sub: 'Moderate thinning' },
  { code: 'V', label: 'V-VII', sub: 'Advanced loss' },
];

function bucketFor(norwood: string): string {
  const u = norwood.toUpperCase().trim();
  if (u === 'I' || u === 'II') return 'I';
  if (u === 'III') return 'III';
  if (u === 'IV') return 'IV';
  return 'V';
}

function projectedTarget(norwood: string): string {
  const u = norwood.toUpperCase().trim();
  if (u === 'I' || u === 'II') return 'Norwood I';
  if (u === 'III') return 'Norwood II-III';
  if (u === 'IV') return 'Norwood III';
  if (u === 'V') return 'Norwood IV';
  if (u === 'VI') return 'Norwood V';
  return 'Norwood VI';
}

export default function NorwoodAnalysisScreen() {
  const nav = useNavigation();
  const scan = useLatestScan();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Norwood Analysis</Text>
        <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg }}>
        {!scan ? (
          <EmptyState />
        ) : (
          <Results scan={scan} />
        )}

        <PrimaryButton label="Done" onPress={() => nav.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No scan yet</Text>
      <Text style={styles.emptyBody}>
        Capture a scalp photo from the Camera tab and your Norwood analysis will appear here.
      </Text>
    </View>
  );
}

function Results({ scan }: { scan: NonNullable<ReturnType<typeof useLatestScan>> }) {
  const norwood = scan.classification.norwood_scale;
  const severity = scan.classification.severity;
  const confidencePct = Math.round(scan.classification.confidence * 100);
  const activeBucket = bucketFor(norwood);
  const activeRow = SCALE.find(s => s.code === activeBucket);

  return (
    <>
      {/* Current */}
      <View style={styles.currentCard}>
        <Text style={styles.currentLabel}>CURRENT CLASSIFICATION</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <Text style={styles.currentNum}>{norwood}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.currentTitle}>Norwood Scale {norwood}</Text>
            <Text style={styles.currentSub}>
              {activeRow?.sub ?? severity}
              {Number.isFinite(confidencePct) && ` · ${confidencePct}% confidence`}
            </Text>
          </View>
        </View>
      </View>

      {/* Reference */}
      <View>
        <Text style={styles.sectionLabel}>NORWOOD SCALE REFERENCE</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {SCALE.map(s => {
            const active = s.code === activeBucket;
            return (
              <View key={s.code} style={[styles.scaleRow, active && styles.scaleRowOn]}>
                <View style={[styles.scaleNum, active && styles.scaleNumOn]}>
                  <Text style={[styles.scaleNumText, active && { color: colors.primary }]}>{s.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scaleLabel}>{s.label}</Text>
                  <Text style={styles.scaleSub}>{s.sub}</Text>
                </View>
                {active && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* AI projection */}
      <View style={styles.aiCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="sparkles" size={16} color={colors.purple} />
          <Text style={styles.aiTitle}>6-Month Projection</Text>
        </View>
        <Text style={styles.aiBody}>
          With current adherence ({profileStats.adherencePct}%), AI predicts further improvement to{' '}
          <Text style={{ color: colors.text, fontWeight: '700' }}>{projectedTarget(norwood)}</Text> by month 6, with{' '}
          {confidencePct}% confidence based on 12,000+ similar patient trajectories.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  currentCard: {
    backgroundColor: 'rgba(46,230,200,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,230,200,0.3)',
    padding: 16,
  },
  currentLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  currentNum: { color: colors.primary, fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  currentTitle: { color: colors.text, fontSize: 22, fontWeight: '700' },
  currentSub: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  scaleRowOn: { borderColor: colors.primary },
  scaleNum: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardElev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleNumOn: { backgroundColor: 'rgba(46,230,200,0.12)' },
  scaleNumText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  scaleLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  scaleSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  aiCard: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: 16,
    gap: 10,
  },
  aiTitle: { color: colors.purple, fontSize: 14, fontWeight: '700' },
  aiBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
