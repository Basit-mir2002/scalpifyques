import type React from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type Protocol = {
  id: string;
  name: string;
  time: string;
  status: 'done' | 'now' | 'upcoming';
  icon: IoniconName;
};

export type JourneyMonth = { m: string; h: number };

export type ScanHistoryEntry = { density: string; date: string; delta: string };

export type StatusPill = { label: string; variant: 'green' | 'purple' };

export const currentUser = {
  id: 'demo_user',
  firstName: 'Ahmed',
  fullName: 'Ahmed Hassan',
  initials: 'AH',
  statusLine: 'Day 47 · Post-FUE transplant',
};

export const recoveryProgress = {
  currentDay: 47,
  totalDays: 180,
  completePct: 26,
  remainingProtocols: 3,
};

export const homeStats = {
  regrowth: { value: '68%', delta: '+12%' },
  adherence: { value: '94%', delta: '+3%' },
  norwood: { value: '3 → 2', delta: '↑↑' },
};

export const todayProtocol: Protocol[] = [
  { id: '1', name: 'Minoxidil 5% — topical', time: '8:00 AM', status: 'done', icon: 'water-outline' },
  { id: '2', name: 'Finasteride 1mg', time: 'Now', status: 'now', icon: 'medical-outline' },
  { id: '3', name: 'Biotin Complex', time: '1:00 PM', status: 'upcoming', icon: 'time-outline' },
  { id: '4', name: 'Evening scalp massage', time: '8:00 PM', status: 'upcoming', icon: 'time-outline' },
];

export const journeyStatusPills: StatusPill[] = [
  { label: '↗ Improving', variant: 'green' },
  { label: 'Norwood III', variant: 'purple' },
];

export const journeyMonths: JourneyMonth[] = [
  { m: 'Jan', h: 0.30 },
  { m: 'Feb', h: 0.40 },
  { m: 'Mar', h: 0.55 },
  { m: 'Apr', h: 0.65 },
  { m: 'May', h: 0.95 },
];

export const scanHistory: ScanHistoryEntry[] = [
  { density: '68%', date: 'May 2, 2025', delta: '+6%' },
  { density: '62%', date: 'Apr 4, 2025', delta: '+4%' },
  { density: '58%', date: 'Mar 7, 2025', delta: '+7%' },
  { density: '51%', date: 'Feb 1, 2025', delta: '+9%' },
];

export const doctor = {
  name: 'Dr. Sara Al-Mansouri',
  role: 'Hair Restoration Surgeon',
  nextConsult: 'May 15',
};

export const profileStats = {
  scans: 24,
  streakDays: 21,
  adherencePct: 94,
};

export const aiInsight = {
  body:
    '"Your adherence rate places you in the top 12% of similar patients. Consistent use through month 3 correlates with 34% better outcomes."',
  caption: 'based on 24 of your scans',
};
