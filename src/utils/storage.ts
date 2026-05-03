import type { Config, TimelineEvent } from '../types';

const KEY = 'anniv_config_v2';
const TIMELINE_KEY = 'anniv_timeline_v1';

export function getDefault(): Config {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    title: '我们的纪念日',
    subtitle: '从遇见你的那一天开始',
    startDateTime: today.toISOString(),
    signature: '',
    photos: [],
    photoInterval: 8,
  };
}

export function load(): Config {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return getDefault();
    const parsed = JSON.parse(raw) as Partial<Config>;
    return { ...getDefault(), ...parsed };
  } catch {
    return getDefault();
  }
}

export function save(c: Config) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function loadTimeline(): TimelineEvent[] {
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TimelineEvent[];
  } catch {
    return [];
  }
}

export function saveTimeline(events: TimelineEvent[]) {
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(events));
}

export interface BackupData {
  version: number;
  exportedAt: string;
  config: Config;
  timeline: TimelineEvent[];
  celebrated: number[];
}

export function exportAll(): string {
  const celebratedKey = 'anniv_celebrated_v3';
  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    config: load(),
    timeline: loadTimeline(),
    celebrated: JSON.parse(localStorage.getItem(celebratedKey) || '[]'),
  };
  return JSON.stringify(data, null, 2);
}

export function triggerExport() {
  const json = exportAll();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `anniversary-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importAll(jsonText: string): boolean {
  try {
    const parsed = JSON.parse(jsonText) as Partial<BackupData>;
    if (!parsed.config && !parsed.timeline) {
      throw new Error('Invalid backup file');
    }
    if (parsed.config) {
      save({ ...getDefault(), ...parsed.config });
    }
    if (parsed.timeline) {
      saveTimeline(parsed.timeline);
    }
    if (parsed.celebrated) {
      localStorage.setItem('anniv_celebrated_v3', JSON.stringify(parsed.celebrated));
    }
    return true;
  } catch {
    return false;
  }
}
