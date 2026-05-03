export interface Config {
  title: string;
  subtitle: string;
  startDateTime: string;
  signature: string;
  photos: string[];
  photoInterval: number;
}

export interface TimeDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}
