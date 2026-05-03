import { useState, useCallback, useEffect, useRef } from 'react';
import BackgroundSlider from './components/BackgroundSlider';
import Castle from './components/Castle';
import CelebrationOverlay from './components/CelebrationOverlay';
import Fireworks from './components/Fireworks';
import Stars from './components/Stars';
import TimeDisplay from './components/TimeDisplay';
import Settings from './components/Settings';
import { load, save } from './utils/storage';
import { calcDiff } from './utils/time';
import type { Config, TimeDiff } from './types';

function App() {
  const [config, setConfig] = useState<Config>(load);
  const [celebrating, setCelebrating] = useState(false);
  const [diff, setDiff] = useState<TimeDiff>(() => calcDiff(new Date(load().startDateTime)));
  const prevMilestoneRef = useRef<number | null>(null);

  const handleSave = useCallback((c: Config) => {
    setConfig(c);
    save(c);
  }, []);

  const triggerCelebration = useCallback((_ms: number) => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 60000);
  }, []);

  const replayCelebration = useCallback(() => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 60000);
  }, []);

  const milestone = diff.totalDays + 1;

  useEffect(() => {
    const start = new Date(config.startDateTime);

    const tick = () => {
      const newDiff = calcDiff(start);
      setDiff(newDiff);
      const newMilestone = newDiff.totalDays + 1;
      const prev = prevMilestoneRef.current;

      // Only trigger when crossing into a milestone day
      if (prev !== null && prev !== newMilestone) {
        if (newMilestone >= 100 && newMilestone % 100 === 0) {
          triggerCelebration(newMilestone);
        }
      }
      prevMilestoneRef.current = newMilestone;
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.startDateTime, triggerCelebration]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Layer 0: photo background */}
      <BackgroundSlider photos={config.photos} />

      {/* Layer 1: deep night gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(20, 10, 60, 0.4) 0%, rgba(5, 5, 16, 0.7) 60%, rgba(5, 5, 16, 0.9) 100%)',
        }}
      />

      {/* Layer 2: stars */}
      <Stars count={180} />

      {/* Layer 3: fireworks canvas */}
      <Fireworks celebrating={celebrating} />

      {/* Layer 4: castle silhouette */}
      <Castle />

      {/* Layer 5: celebration overlay */}
      <CelebrationOverlay milestone={milestone} active={celebrating} photos={config.photos} />

      {/* Layer 6: content */}
      {!celebrating && (
        <div className="absolute inset-0 z-[30] flex items-center justify-center pointer-events-none">
          <TimeDisplay config={config} />
        </div>
      )}

      {/* Layer 7: settings */}
      <Settings config={config} onSave={handleSave} onReplayCelebration={replayCelebration} />
    </div>
  );
}

export default App;
