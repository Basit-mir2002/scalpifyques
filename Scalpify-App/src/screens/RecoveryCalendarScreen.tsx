import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CircleIconButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// May 2025 starts Thursday
const FIRST_WEEKDAY = 4;
const DAYS_IN_MONTH = 31;
const TODAY = 2;
const MILESTONES = [7, 21, 28];

const PHASES = [
  { color: colors.orange, name: 'Initial Healing', days: 'Days 1–14', body: 'Graft anchoring, avoid touching', state: 'done' as const },
  { color: colors.purple, name: 'Shedding Phase', days: 'Days 15–28', body: 'Normal shock loss, stay consistent', state: 'current' as const },
  { color: colors.textMuted, name: 'Dormant Phase', days: 'Days 29–90', body: 'Follicles preparing for regrowth', state: 'upcoming' as const },
  { color: colors.primary, name: 'Active Regrowth', days: 'Days 90–180', body: 'Visible growth begins, celebrate!', state: 'upcoming' as const },
];

export default function RecoveryCalendarScreen() {
  const nav = useNavigation();
  const [selected, setSelected] = useState(TODAY);

  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY).fill(null),
    ...Array(DAYS_IN_MONTH).fill(0).map((_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Recovery Calendar</Text>
            <Text style={styles.subtitle}>Day 47 of 180 · Phase 2</Text>
          </View>
          <CircleIconButton icon="chevron-back" onPress={() => nav.goBack()} />
        </View>

        {/* Month switcher */}
        <View style={styles.monthRow}>
          <CircleIconButton icon="chevron-back" />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.monthLabel}>May 2025</Text>
            <Text style={styles.monthSub}>Month 2 of Recovery</Text>
          </View>
          <CircleIconButton icon="chevron-forward" />
        </View>

        {/* Calendar */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <View style={styles.calCard}>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((d, i) => (
                <Text key={`${d}-${i}`} style={styles.weekDay}>{d}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={i} style={styles.cell} />;
                const isToday = day === TODAY;
                const isSel = day === selected;
                const isMilestone = MILESTONES.includes(day);
                const isFuture = day > TODAY;
                return (
                  <Pressable key={i} style={styles.cell} onPress={() => setSelected(day)}>
                    <View
                      style={[
                        styles.dayBubble,
                        isToday && styles.dayToday,
                        isSel && !isToday && styles.daySel,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isFuture && { color: colors.textDim },
                          isToday && { color: '#001712', fontWeight: '700' },
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                    {isMilestone && <View style={styles.milestoneDot} />}
                    {day === 1 && <View style={[styles.milestoneDot, { backgroundColor: colors.primary }]} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <Legend dotColor="#22C55E" label="Done" />
              <Legend dotColor={colors.primary} label="Today" />
              <Legend dotColor={colors.orange} label="Milestone" />
              <Legend dotColor="#DC2626" label="Missed" />
            </View>
          </View>
        </View>

        {/* Selected day card */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <View style={styles.dayCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.dayCardDate}>May {selected}, 2025</Text>
              {selected === TODAY && (
                <View style={styles.todayPill}>
                  <Text style={styles.todayPillText}>TODAY</Text>
                </View>
              )}
            </View>
            {selected === TODAY ? (
              <View style={{ marginTop: 14, gap: 8 }}>
                <Text style={styles.dayLine}>✓ Morning minoxidil applied</Text>
                <Text style={[styles.dayLine, { color: colors.orange }]}>⏱ Finasteride — due now</Text>
                <Text style={styles.dayLine}>○ Evening scan pending</Text>
              </View>
            ) : (
              <Text style={[styles.dayLine, { marginTop: 14, color: colors.textMuted }]}>
                No data yet — protocol scheduled for this day
              </Text>
            )}
          </View>
        </View>

        {/* Phases */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xxl }}>
          <Text style={styles.sectionLabel}>RECOVERY PHASES</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {PHASES.map(p => (
              <View
                key={p.name}
                style={[
                  styles.phaseRow,
                  { borderLeftColor: p.color },
                  p.state === 'current' && {
                    backgroundColor: 'rgba(139,92,246,0.06)',
                    borderColor: 'rgba(139,92,246,0.3)',
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.phaseName}>{p.name}</Text>
                    {p.state === 'current' && (
                      <View style={styles.currentChip}>
                        <Text style={styles.currentChipText}>CURRENT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.phaseDays, { color: p.color }]}>{p.days}</Text>
                  <Text style={styles.phaseBody}>{p.body}</Text>
                </View>
                {p.state === 'done' && <Ionicons name="checkmark" size={20} color="#22C55E" />}
                {p.state === 'current' && <Ionicons name="checkmark" size={20} color={colors.purple} />}
                {p.state === 'upcoming' && <Ionicons name="time-outline" size={20} color={colors.textDim} />}
              </View>
            ))}
          </View>
        </View>

        {/* AI Projection */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <View style={styles.aiCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="sparkles" size={16} color={colors.purple} />
              <Text style={styles.aiTitle}>AI Recovery Projection</Text>
            </View>
            <Text style={styles.aiBody}>
              At your current adherence rate, you are projected to reach{' '}
              <Text style={{ color: colors.text, fontWeight: '700' }}>Active Regrowth Phase</Text> by{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>August 15, 2025</Text> — 11 days ahead of the median.
            </Text>
            <Text style={styles.aiCaption}>based on 24 of your scans · 89% confidence</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ dotColor, label }: { dotColor: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  monthLabel: { color: colors.text, fontSize: 22, fontWeight: '700' },
  monthSub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  calCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  weekDay: { color: colors.textMuted, fontSize: 12, width: 36, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  daySel: { borderWidth: 1.5, borderColor: colors.primary },
  dayText: { color: colors.text, fontSize: 14 },
  milestoneDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.orange, marginTop: 2 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  dayCardDate: { color: colors.text, fontSize: 18, fontWeight: '700' },
  todayPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(46,230,200,0.4)',
    backgroundColor: 'rgba(46,230,200,0.10)',
  },
  todayPillText: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  dayLine: { color: colors.text, fontSize: 14, lineHeight: 22 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  phaseRow: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  phaseName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  phaseDays: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  phaseBody: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  currentChip: {
    backgroundColor: colors.purpleSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  currentChipText: { color: colors.purple, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
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
  aiCaption: { color: colors.textMuted, fontSize: 12 },
});
