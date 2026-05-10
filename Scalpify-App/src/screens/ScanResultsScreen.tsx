import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CircleIconButton, Pill, PrimaryButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { useLatestScanFull } from '../scanStore';
import { generateHairJourney, type HairJourneyResponse } from '../api';
import type { RootStackParamList } from '../navigation';

const STAGE_LABELS: Record<number, { title: string; sub: string }> = {
  1: { title: '15 days', sub: 'Initial healing · grafts settling' },
  2: { title: '1 month', sub: 'Early stubble · ~10-15% coverage' },
  3: { title: '3 months', sub: 'Visible regrowth · ~40-50% coverage' },
  4: { title: '4 months', sub: 'Filling in · ~55-65% coverage' },
  5: { title: '6 months', sub: 'Established density · ~75-85% coverage' },
  6: { title: '8 months', sub: 'Final projection · 95-100% coverage' },
};

type GenState =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ok'; data: HairJourneyResponse }
  | { kind: 'error'; message: string };

export default function ScanResultsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scan = useLatestScanFull();
  const [gen, setGen] = useState<GenState>({ kind: 'idle' });

  if (!scan) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
          <Text style={styles.headerTitle}>Scan Results</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No scan yet</Text>
          <Text style={styles.emptyBody}>
            Take a scalp scan from the camera tab and your results will appear here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  async function runGenerate() {
    if (!scan) return;
    setGen({ kind: 'busy' });
    try {
      const data = await generateHairJourney(scan.photoUri);
      setGen({ kind: 'ok', data });
    } catch (e: any) {
      setGen({ kind: 'error', message: e?.message ?? String(e) });
    }
  }

  const m = scan.data.measurements.percentage;
  const c = scan.data.classification;
  const confidencePct = Math.round((c.confidence ?? 0) * 100);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40, gap: spacing.lg }}>
        {/* Captured photo */}
        <Image source={{ uri: scan.photoUri }} style={styles.photo} resizeMode="cover" />

        {/* Headline */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Pill label="Scan complete" variant="teal" icon="checkmark-circle" />
          {Number.isFinite(confidencePct) && (
            <Pill label={`${confidencePct}% confidence`} variant="purple" />
          )}
        </View>

        {/* Stats */}
        <View style={styles.statRow}>
          <Stat value={`${m.hair_coverage.toFixed(0)}%`} label="HAIR COVERAGE" tone="primary" />
          <Stat value={`${m.baldness_ratio.toFixed(0)}%`} label="BALDNESS" tone="orange" />
        </View>
        <View style={styles.statRow}>
          <Stat value={c.severity} label="SEVERITY" />
          <Stat value={c.norwood_scale} label="NORWOOD" />
        </View>

        {/* Journey generator */}
        <View style={styles.aiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="sparkles" size={16} color={colors.purple} />
            <Text style={styles.aiTitle}>Recovery Preview</Text>
          </View>
          <Text style={styles.aiBody}>
            Generate an AI projection of how your hair could look across a{' '}
            <Text style={{ color: colors.text, fontWeight: '700' }}>6-stage 8-month timeline</Text>{' '}
            — 15 days, 1, 3, 4, 6, and 8 months post-FUE transplant — based on this scan.
          </Text>

          {gen.kind === 'idle' && (
            <PrimaryButton label="Generate recovery preview" onPress={runGenerate} />
          )}

          {gen.kind === 'busy' && (
            <View style={styles.busyBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.busyTitle}>Generating your 8-month preview…</Text>
              <Text style={styles.busySub}>
                Running 6 AI editing passes (15 days → 8 months). This typically takes
                2–3 minutes due to Replicate API rate limits.
              </Text>
            </View>
          )}

          {gen.kind === 'error' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Couldn't generate preview</Text>
              <Text style={styles.errorBody}>{gen.message}</Text>
              <Pressable style={styles.retryBtn} onPress={runGenerate}>
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Stage results */}
        {gen.kind === 'ok' && gen.data.result && (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.sectionLabel}>YOUR RECOVERY TIMELINE</Text>
            <Image source={{ uri: scan.photoUri }} style={styles.stageImage} resizeMode="cover" />
            <View style={styles.stageMeta}>
              <Text style={styles.stageTitle}>Today</Text>
              <Text style={styles.stageSub}>Original scan · {m.hair_coverage.toFixed(0)}% coverage</Text>
            </View>

            {gen.data.result.iterations
              .slice()
              .sort((a, b) => a.iteration_number - b.iteration_number)
              .map(it => {
                const labels = STAGE_LABELS[it.iteration_number] ?? {
                  title: `Stage ${it.iteration_number}`,
                  sub: '',
                };
                return (
                  <View key={it.iteration_number} style={{ gap: 8 }}>
                    <Image source={{ uri: it.image_url }} style={styles.stageImage} resizeMode="cover" />
                    <View style={styles.stageMeta}>
                      <Text style={styles.stageTitle}>{labels.title} post-FUE</Text>
                      <Text style={styles.stageSub}>{labels.sub}</Text>
                    </View>
                  </View>
                );
              })}

            <PrimaryButton
              label="Continue"
              onPress={() => nav.navigate('NextSteps')}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone?: 'primary' | 'orange';
}) {
  const color =
    tone === 'primary' ? colors.primary : tone === 'orange' ? colors.orange : colors.text;
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.cardElev,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.2, fontWeight: '600' },
  aiCard: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: 16,
    gap: 12,
  },
  aiTitle: { color: colors.purple, fontSize: 14, fontWeight: '700' },
  aiBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  busyBox: { gap: 8, alignItems: 'center', paddingVertical: spacing.md },
  busyTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  busySub: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.05)',
    borderColor: 'rgba(239,68,68,0.3)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    gap: 8,
  },
  errorTitle: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  errorBody: { color: colors.text, fontSize: 13, lineHeight: 19 },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
  retryBtnText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  stageImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.cardElev,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageMeta: { gap: 2, marginBottom: spacing.sm },
  stageTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  stageSub: { color: colors.textMuted, fontSize: 13 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
