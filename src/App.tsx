import { useState, useCallback, useEffect, useRef } from 'react';
import BackgroundSlider from './components/BackgroundSlider';
import Castle from './components/Castle';
import CelebrationOverlay from './components/CelebrationOverlay';
import Fireworks from './components/Fireworks';
import Settings from './components/Settings';
import Stars from './components/Stars';
import TimeDisplay from './components/TimeDisplay';
import Timeline from './components/Timeline';
import { load, save, loadTimeline, saveTimeline } from './utils/storage';
import { calcDiff } from './utils/time';
import type { Config, TimeDiff, TimelineEvent } from './types';

function App() {
  const [config, setConfig] = useState<Config>(load);
  const [celebrating, setCelebrating] = useState(false);
  const [diff, setDiff] = useState<TimeDiff>(() => calcDiff(new Date(load().startDateTime)));
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(loadTimeline);
  const [showTimeline, setShowTimeline] = useState(false);
  const prevMilestoneRef = useRef<number | null>(null);

  const handleSave = useCallback((c: Config) => {
    setConfig(c);
    save(c);
  }, []);

  const handleSaveTimeline = useCallback((events: TimelineEvent[]) => {
    setTimelineEvents(events);
    saveTimeline(events);
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

      {/* Timeline entry button */}
      {!showTimeline && (
        <button
          onClick={() => setShowTimeline(true)}
          className="fixed bottom-5 left-5 z-[40] p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
          aria-label="时间线"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
          </svg>
        </button>
      )}

      {/* Timeline overlay */}
      {showTimeline && (
        <Timeline
          events={timelineEvents}
          startDate={config.startDateTime}
          onSave={handleSaveTimeline}
          onClose={() => setShowTimeline(false)}
        />
      )}
    </div>
  );
}

export default App;
