import type { TimeDiff } from '../types';

export function calcDiff(start: Date): TimeDiff {
  const now = new Date();
  const s = new Date(start);
  if (s > now) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };

  let years = now.getFullYear() - s.getFullYear();
  let months = now.getMonth() - s.getMonth();
  let days = now.getDate() - s.getDate();
  let hours = now.getHours() - s.getHours();
  let minutes = now.getMinutes() - s.getMinutes();
  let seconds = now.getSeconds() - s.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((now.getTime() - s.getTime()) / msPerDay);

  return { years, months, days, hours, minutes, seconds, totalDays };
}
