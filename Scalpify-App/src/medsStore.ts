import React, { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = 'scalpify.meds.v1';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type Med = {
  id: string;
  name: string;
  type: string;
  time: string;
  weeklyPct: number;
  icon: IoniconName;
  iconColor: string;
  iconBg: string;
};

let meds: Med[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

async function persist() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
}

export async function hydrateMeds(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    meds = raw ? (JSON.parse(raw) as Med[]) : [];
  } catch {
    meds = [];
  }
  hydrated = true;
  emit();
}

export async function addMed(med: Omit<Med, 'id'>): Promise<Med> {
  const item: Med = { ...med, id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}` };
  meds = [...meds, item];
  emit();
  await persist();
  return item;
}

export async function removeMed(id: string): Promise<void> {
  meds = meds.filter(m => m.id !== id);
  emit();
  await persist();
}

export async function clearMeds(): Promise<void> {
  meds = [];
  emit();
  await persist();
}

export function useMeds(): Med[] {
  return useSyncExternalStore(subscribe, () => meds, () => meds);
}

export function useMedsHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => hydrated, () => hydrated);
}

export function nextDoseFor(med: Med, now: Date = new Date()): Date {
  const [hh, mm] = med.time.split(':').map(n => parseInt(n, 10));
  const d = new Date(now);
  d.setHours(hh || 0, mm || 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

export function statusForToday(med: Med, now: Date = new Date()): 'done' | 'now' | 'upcoming' {
  const [hh, mm] = med.time.split(':').map(n => parseInt(n, 10));
  const dose = new Date(now);
  dose.setHours(hh || 0, mm || 0, 0, 0);
  const diffMin = (now.getTime() - dose.getTime()) / 60_000;
  if (diffMin < -15) return 'upcoming';
  if (diffMin > 60) return 'done';
  return 'now';
}

export function formatTime(t: string): string {
  const [hhStr, mmStr] = t.split(':');
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return t;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${mm.toString().padStart(2, '0')} ${ampm}`;
}
