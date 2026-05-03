import { useState, useEffect, useCallback } from 'react';
import { calcDiff } from '../utils/time';
import type { TimeDiff } from '../types';

export function useTimer(startIso: string) {
  const [diff, setDiff] = useState<TimeDiff>(() => calcDiff(new Date(startIso)));

  const tick = useCallback(() => {
    setDiff(calcDiff(new Date(startIso)));
  }, [startIso]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return diff;
}
