import type { Config } from '../types';

const KEY = 'anniv_config_v2';

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
