import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, CircleIconButton } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';
import { daysSinceSurgery, firstNameOf, useUser } from '../userStore';
import { formatTime, statusForToday, useMeds, type Med } from '../medsStore';
import { useLatestScanFull } from '../scanStore';

const TOTAL_RECOVERY_DAYS = 180;

function greetingForHour(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUser();
  const meds = useMeds();
  const latestScan = useLatestScanFull();

  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const firstName = firstNameOf(user);

  const dayCount = daysSinceSurgery(user);
  const completePct =
    dayCount === null ? null : Math.min(100, Math.round((dayCount / TOTAL_RECOVERY_DAYS) * 100));

  const todayProtocol = useMemo(
    () => meds.map(m => ({ ...m, status: statusForToday(m) })),
    [meds],
  );
  const remaining = todayProtocol.filter(p => p.status !== 'done').length;

  const norwoodValue = latestScan?.data.classification.norwood_scale ?? '—';
  const coverage = latestScan?.data.measurements.percentage.hair_coverage;
  const regrowthValue = coverage != null ? `${Math.round(coverage)}%` : '—';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greet}>{greeting}</Text>
            <Text style={styles.name}>{firstName || 'there'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CircleIconButton icon="chatbubble-ellipses" bg={colors.purpleSoft} color={colors.purple} />
            <View>
              <CircleIconButton icon="notifications-outline" bg={colors.bgElev} border={colors.border} />
              {remaining > 0 && <View style={styles.dot} />}
            </View>
          </View>
        </View>

        {/* Recovery progress card */}
        <Pressable onPress={() => nav.navigate('RecoveryCalendar')} style={{ paddingHorizontal: spacing.xl }}>
          <Card style={styles.progressCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressLabel}>RECOVERY PROGRESS</Text>
              {dayCount === null || completePct === null ? (
                <>
                  <Text style={styles.progressDay}>Surgery date not set</Text>
                  <Text style={styles.progressHint}>
                    Add it in Profile to start tracking your recovery timeline.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.progressDay}>
                    Day {dayCount} of {TOTAL_RECOVERY_DAYS}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
                    <Text style={styles.progressBig}>{completePct}</Text>
                    <Text style={styles.progressPct}>%</Text>
                    <Text style={styles.progressComplete}>complete</Text>
                  </View>
                </>
              )}
            </View>
            <ProgressRing pct={completePct ?? 0} dayLabel={dayCount === null ? '—' : `D${dayCount}`} />
          </Card>
        </Pressable>

        {/* Stat row */}
        <View style={styles.statRow}>
          <StatCard value={regrowthValue} label="COVERAGE" hint={coverage == null ? 'No scan yet' : 'Latest scan'} />
          <StatCard value="—" label="ADHERENCE" hint="Coming soon" />
          <StatCard
            value={norwoodValue}
            label="NORWOOD"
            hint={latestScan ? 'Tap to view' : 'Take a scan'}
            onPress={() => nav.navigate('NorwoodAnalysis')}
          />
        </View>

        {/* Today's protocol */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xxl }}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today's Protocol</Text>
            {todayProtocol.length > 0 && (
              <Text style={styles.sectionAside}>{remaining} remaining</Text>
            )}
          </View>
          <View style={{ gap: 10, marginTop: 12 }}>
            {todayProtocol.length === 0 ? (
              <ProtocolEmpty onPress={() => nav.navigate('MainTabs' as never)} />
            ) : (
              todayProtocol.map(p => <ProtocolRow key={p.id} item={p} />)
            )}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction
            icon="camera"
            iconColor={colors.primary}
            iconBg="rgba(46,230,200,0.10)"
            title="Weekly Scan"
            sub="AI analysis ~30s"
            onPress={() => nav.navigate('Camera')}
          />
          <QuickAction
            icon="clipboard-outline"
            iconColor={colors.purple}
            iconBg={colors.purpleSoft}
            title="Check-In"
            sub="Daily symptom log"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressRing({ pct, dayLabel }: { pct: number; dayLabel: string }) {
  return (
    <View style={styles.ring}>
      <View style={styles.ringInner}>
        <Text style={styles.ringPct}>{pct}%</Text>
        <Text style={styles.ringSub}>{dayLabel}</Text>
      </View>
    </View>
  );
}

function StatCard({
  value,
  label,
  hint,
  onPress,
}: {
  value: string;
  label: string;
  hint?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card style={styles.stat}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {hint && <Text style={styles.statHint}>{hint}</Text>}
      </Card>
    </Pressable>
  );
}

function ProtocolRow({ item }: { item: Med & { status: 'done' | 'now' | 'upcoming' } }) {
  const isNow = item.status === 'now';
  const isDone = item.status === 'done';
  return (
    <View
      style={[
        styles.protocolRow,
        isNow && { borderColor: colors.orange, backgroundColor: colors.orangeSoft },
      ]}
    >
      <View
        style={[
          styles.protocolIcon,
          isDone && { backgroundColor: 'rgba(46,230,200,0.12)' },
          isNow && { backgroundColor: 'rgba(249,115,22,0.18)' },
        ]}
      >
        <Ionicons
          name={isDone ? 'checkmark' : item.icon}
          size={18}
          color={isDone ? colors.primary : isNow ? colors.orange : colors.textMuted}
        />
      </View>
      <Text style={[styles.protocolName, isDone && { color: colors.textMuted }]}>{item.name}</Text>
      <Text style={[styles.protocolTime, isNow && { color: colors.orange }]}>
        {isNow ? 'Now' : formatTime(item.time)}
      </Text>
      {isNow && <Ionicons name="chevron-forward" size={16} color={colors.orange} />}
    </View>
  );
}

function ProtocolEmpty({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.protocolEmpty}>
      <View style={styles.protocolEmptyIcon}>
        <Ionicons name="add" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.protocolEmptyTitle}>No medications added</Text>
        <Text style={styles.protocolEmptySub}>
          Add your treatment plan from the Meds tab to see daily reminders here.
        </Text>
      </View>
    </Pressable>
  );
}

function QuickAction({
  icon,
  iconColor,
  iconBg,
  title,
  sub,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  sub: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card style={styles.quick}>
        <View style={[styles.quickIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View>
          <Text style={styles.quickTitle}>{title}</Text>
          <Text style={styles.quickSub}>{sub}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  greet: { color: colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  name: { color: colors.text, fontSize: 32, fontWeight: '700', marginTop: 4 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.orange,
    position: 'absolute',
    top: 2,
    right: 2,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(46,230,200,0.05)',
    borderColor: 'rgba(46,230,200,0.2)',
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressDay: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  progressHint: { color: colors.textMuted, fontSize: 12, marginTop: 6, lineHeight: 18, paddingRight: 8 },
  progressBig: { color: colors.text, fontSize: 56, fontWeight: '700', lineHeight: 56 },
  progressPct: { color: colors.text, fontSize: 28, fontWeight: '700' },
  progressComplete: { color: colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 8, marginBottom: 8 },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: 'rgba(46,230,200,0.18)',
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: { transform: [{ rotate: '-45deg' }], alignItems: 'center' },
  ringPct: { color: colors.text, fontSize: 22, fontWeight: '700' },
  ringSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  stat: { padding: spacing.md, gap: 6 },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 1.2, fontWeight: '600' },
  statHint: { color: colors.textMuted, fontSize: 11 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sectionAside: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  protocolIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardElev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolName: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  protocolTime: { color: colors.textMuted, fontSize: 13 },
  protocolEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 14,
  },
  protocolEmptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46,230,200,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolEmptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  protocolEmptySub: { color: colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  quick: { gap: 10, padding: 14 },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  quickSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
