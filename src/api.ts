import type { Config, TimelineEvent } from './types';

const TOKEN_KEY = 'anniv_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function headers(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...headers(), ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let err;
    try { err = JSON.parse(text); } catch { err = {}; }
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function login(username: string, password: string): Promise<string> {
  const data = await req<{ token: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data.token;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await req('/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function getConfig(): Promise<Config> {
  return req<Config>('/config');
}

export async function saveConfig(config: Config): Promise<void> {
  await req('/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  return req<TimelineEvent[]>('/timeline');
}

export async function saveTimeline(events: TimelineEvent[]): Promise<void> {
  await req('/timeline', {
    method: 'POST',
    body: JSON.stringify(events),
  });
}

export async function getCelebrated(): Promise<number[]> {
  return req<number[]>('/celebrated');
}

export async function saveCelebrated(milestones: number[]): Promise<void> {
  await req('/celebrated', {
    method: 'POST',
    body: JSON.stringify({ milestones }),
  });
}

export async function uploadPhoto(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text.slice(0, 100));
  }
  const data = await res.json() as { url: string };
  return data.url;
}
