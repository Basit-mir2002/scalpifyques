import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CircleIconButton, Pill } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { journeyMonths, journeyStatusPills, scanHistory } from '../data';

const TIMELINE = ['1mo', '2mo', '3mo', '6mo', '9mo'];

const PHASE_COPY: Record<string, { label: string; phase: string; title: string; body: string }> = {
  '1mo': {
    label: '1 month',
    phase: 'Healing',
    title: 'Initial Recovery',
    body: 'Grafts anchoring. Avoid direct sun, tight hats and strenuous activity. Swelling resolves by day 5–7.',
  },
  '2mo': {
    label: '2 months',
    phase: 'Shedding',
    title: 'Shock Loss',
    body: 'Most transplanted hairs shed normally. This is expected and temporary — your follicles are still active beneath the skin.',
  },
  '3mo': {
    label: '3 months',
    phase: 'Dormant',
    title: 'Dormant Phase',
    body: 'Follicles are resting before active regrowth. No visible growth yet, but the foundation is being laid.',
  },
  '6mo': {
    label: '6 months',
    phase: 'Regrowth',
    title: 'Active Regrowth',
    body: 'New hair is now visibly emerging. Density continues to increase steadily over the next 3–6 months.',
  },
  '9mo': {
    label: '9 months',
    phase: 'Maturing',
    title: 'Maturing Hair',
    body: 'Hair is thickening and texture is approaching final result. Most patients see ~80% of final density at this stage.',
  },
};

export default function JourneyScreen() {
  const [active, setActive] = useState('1mo');
  const phase = PHASE_COPY[active];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Your Progress</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {journeyStatusPills.map(p => (
                <Pill key={p.label} label={p.label} variant={p.variant} />
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CircleIconButton icon="calendar-outline" bg={colors.bgElev} border={colors.border} color={colors.primary} />
            <CircleIconButton icon="git-compare-outline" bg={colors.bgElev} border={colors.border} />
          </View>
        </View>

        {/* Density chart */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <Card style={{ paddingVertical: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={styles.chartLabel}>DENSITY SCORE — LAST 5 MONTHS</Text>
              <Pressable hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="download-outline" size={14} color={colors.primary} />
                <Text style={styles.exportText}>Export PDF</Text>
              </Pressable>
            </View>
            <View style={styles.barRow}>
              {journeyMonths.map((m, i) => {
                const isLast = i === journeyMonths.length - 1;
                return (
                  <View key={m.m} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: 90 * m.h,
                          backgroundColor: isLast ? colors.primary : colors.primaryDim,
                          shadowColor: isLast ? colors.primary : 'transparent',
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{m.m}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Recovery timeline tabs */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[styles.chartLabel, { paddingHorizontal: spacing.xl, marginBottom: 12 }]}>
            RECOVERY TIMELINE
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timelineScroller}>
            {TIMELINE.map(t => {
              const on = t === active;
              return (
                <Pressable key={t} onPress={() => setActive(t)} style={[styles.tlChip, on && styles.tlChipOn]}>
                  <Text style={[styles.tlChipText, on && styles.tlChipTextOn]}>{t}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Phase card */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <Card style={{ borderColor: 'rgba(46,230,200,0.3)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.phaseHead}>{phase.label}</Text>
              <View style={styles.phaseDot} />
              <Text style={styles.phaseSub}>{phase.phase}</Text>
            </View>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            <Text style={styles.phaseBody}>{phase.body}</Text>
          </Card>
        </View>

        {/* Scan history */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xxl }}>
          <View style={styles.scanHead}>
            <Text style={styles.sectionTitle}>Scan History</Text>
            <Pressable hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.viewAll}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <View style={{ gap: 10, marginTop: 12 }}>
            {scanHistory.map(s => (
              <View key={s.date} style={styles.scanRow}>
                <View style={styles.scanThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanDensity}>Density: {s.density}</Text>
                  <Text style={styles.scanDate}>{s.date}</Text>
                </View>
                <Text style={styles.scanDelta}>↑ {s.delta}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  chartLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  exportText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  barRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 110 },
  barCol: { alignItems: 'center', gap: 8, flex: 1 },
  bar: {
    width: 36,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  barLabel: { color: colors.textMuted, fontSize: 12 },
  timelineScroller: { paddingHorizontal: spacing.xl, gap: 10 },
  tlChip: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  tlChipText: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
  tlChipTextOn: { color: '#001712', fontWeight: '700' },
  phaseHead: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  phaseDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textMuted },
  phaseSub: { color: colors.textMuted, fontSize: 14 },
  phaseTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 8 },
  phaseBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginTop: 8 },
  scanHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  viewAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  scanThumb: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B1735' },
  scanDensity: { color: colors.text, fontSize: 15, fontWeight: '600' },
  scanDate: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  scanDelta: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
});
