import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';
import { aiInsight, doctor, profileStats } from '../data';
import { daysSinceSurgery, initialsOf, signOut, useUser } from '../userStore';

const SETTINGS: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; iconColor: string; iconBg: string }[] = [
  { icon: 'notifications-outline', label: 'Notifications', iconColor: colors.primary, iconBg: 'rgba(46,230,200,0.12)' },
  { icon: 'lock-closed-outline', label: 'Privacy & Data', iconColor: colors.purple, iconBg: colors.purpleSoft },
  { icon: 'document-text-outline', label: 'Medical History', iconColor: '#22C55E', iconBg: 'rgba(34,197,94,0.12)' },
  { icon: 'mail-outline', label: 'Support', iconColor: colors.orange, iconBg: colors.orangeSoft },
  { icon: 'settings-outline', label: 'Settings', iconColor: colors.textMuted, iconBg: colors.cardElev },
];

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUser();
  const day = daysSinceSurgery(user);
  const statusLine =
    day === null
      ? user
        ? 'Surgery date not set'
        : 'Not signed in'
      : `Day ${day} · Recovery in progress`;

  async function handleSignOut() {
    await signOut();
    nav.reset({ index: 0, routes: [{ name: 'Splash' }] });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 140, gap: spacing.lg }}>
        {/* User row */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(user) || '—'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName ?? 'Guest'}</Text>
            <Text style={styles.userMeta}>{statusLine}</Text>
          </View>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>

        {/* Doctor card */}
        <View style={[styles.doctorCard, { borderLeftColor: colors.primary }]}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorRole}>{doctor.role}</Text>
            <Text style={styles.doctorConsult}>Next consult: {doctor.nextConsult}</Text>
          </View>
          <View style={styles.mailBtn}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat value={String(profileStats.scans)} label="SCANS" />
          <Stat value={`${profileStats.streakDays}d`} label="STREAK" />
          <Stat value={`${profileStats.adherencePct}%`} label="ADHERENCE" />
        </View>

        {/* AI insight */}
        <View style={styles.aiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="sparkles" size={16} color={colors.purple} />
              <Text style={styles.aiTitle}>AI Insight</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.aiAsk}>Ask AI</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.purple} />
            </View>
          </View>
          <Text style={styles.aiBody}>{aiInsight.body}</Text>
          <Text style={styles.aiCaption}>{aiInsight.caption}</Text>
        </View>

        {/* Settings list */}
        <Text style={styles.sectionLabel}>ACCOUNT & SETTINGS</Text>
        <View style={{ gap: 10 }}>
          {SETTINGS.map(s => (
            <Pressable key={s.label} style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: s.iconBg }]}>
                <Ionicons name={s.icon} size={18} color={s.iconColor} />
              </View>
              <Text style={styles.settingLabel}>{s.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.signOut} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#3B2BCB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B2BCB',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  userName: { color: colors.text, fontSize: 22, fontWeight: '700' },
  userMeta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 14,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0F4D5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  doctorRole: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  doctorConsult: { color: colors.primary, fontSize: 13, marginTop: 4 },
  mailBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46,230,200,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.2, fontWeight: '600', marginTop: 4 },
  aiCard: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: 16,
    gap: 10,
  },
  aiTitle: { color: colors.purple, fontSize: 14, fontWeight: '700' },
  aiAsk: { color: colors.purple, fontSize: 13, fontWeight: '600' },
  aiBody: { color: colors.text, fontSize: 15, lineHeight: 22 },
  aiCaption: { color: colors.textMuted, fontSize: 12 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  signOutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
