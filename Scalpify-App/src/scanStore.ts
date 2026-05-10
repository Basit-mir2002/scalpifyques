import { useSyncExternalStore } from 'react';
import type { AnalyzeResponse } from './api';

export type LatestScan = {
  data: AnalyzeResponse;
  photoUri: string;
  capturedAt: number;
};

let latest: LatestScan | null = null;
const listeners = new Set<() => void>();

export function setLatestScan(data: AnalyzeResponse, photoUri: string) {
  latest = { data, photoUri, capturedAt: Date.now() };
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot() {
  return latest;
}

export function useLatestScan(): AnalyzeResponse | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)?.data ?? null;
}

export function useLatestScanFull(): LatestScan | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
