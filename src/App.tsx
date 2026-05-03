import { useState, useCallback, useEffect, useRef } from 'react';
import BackgroundSlider from './components/BackgroundSlider';
import Castle from './components/Castle';
import CelebrationOverlay from './components/CelebrationOverlay';
import Fireworks from './components/Fireworks';
import Login from './components/Login';
import Settings from './components/Settings';
import Stars from './components/Stars';
import TimeDisplay from './components/TimeDisplay';
import Timeline from './components/Timeline';
import { isLoggedIn, getConfig, saveConfig, getTimeline, saveTimeline, getCelebrated, saveCelebrated, clearToken } from './api';
import { getDefault } from './utils/storage';
import { calcDiff } from './utils/time';
import type { Config, TimeDiff, TimelineEvent } from './types';

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [config, setConfig] = useState<Config>(getDefault());
  const [celebrating, setCelebrating] = useState(false);
  const [diff, setDiff] = useState<TimeDiff>(calcDiff(new Date(getDefault().startDateTime)));
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [celebrated, setCelebrated] = useState<number[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevMilestoneRef = useRef<number | null>(null);

  // Load data from backend on mount / login
  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;

    async function loadAll() {
      try {
        const [cfg, tl, cel] = await Promise.all([
          getConfig(),
          getTimeline(),
          getCelebrated(),
        ]);
        if (cancelled) return;
        setConfig(cfg);
        setTimelineEvents(tl);
        setCelebrated(cel);
        setDiff(calcDiff(new Date(cfg.startDateTime)));
      } catch (err) {
        console.error('Failed to load data:', err);
        // Token might be expired
        if ((err as Error).message.includes('Unauthorized')) {
          clearToken();
          setLoggedIn(false);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [loggedIn]);

  // Timer tick
  useEffect(() => {
    if (!loggedIn || loading) return;
    const start = new Date(config.startDateTime);

    const tick = () => {
      const newDiff = calcDiff(start);
      setDiff(newDiff);
      const newMilestone = newDiff.totalDays + 1;
      const prev = prevMilestoneRef.current;

      if (prev !== null && prev !== newMilestone) {
        if (newMilestone >= 100 && newMilestone % 100 === 0 && !celebrated.includes(newMilestone)) {
          triggerCelebration(newMilestone);
        }
      }
      prevMilestoneRef.current = newMilestone;
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [loggedIn, loading, config.startDateTime, celebrated]);

  const triggerCelebration = useCallback(async (ms: number) => {
    setCelebrating(true);
    try {
      const updated = [...celebrated, ms];
      setCelebrated(updated);
      await saveCelebrated(updated);
    } catch (err) {
      console.error('Failed to save celebrated:', err);
    }
    setTimeout(() => setCelebrating(false), 60000);
  }, [celebrated]);

  const replayCelebration = useCallback(() => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 60000);
  }, []);

  const handleSaveConfig = useCallback(async (c: Config) => {
    setConfig(c);
    try {
      await saveConfig(c);
    } catch (err) {
      console.error('Failed to save config:', err);
      alert('保存失败，请检查网络');
    }
  }, []);

  const handleSaveTimeline = useCallback(async (events: TimelineEvent[]) => {
    setTimelineEvents(events);
    try {
      await saveTimeline(events);
    } catch (err) {
      console.error('Failed to save timeline:', err);
      alert('保存失败，请检查网络');
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setLoggedIn(false);
    setLoading(true);
  }, []);

  const milestone = diff.totalDays + 1;

  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 40%, #2d1b4e 80%, #0d0d35 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <div className="w-6 h-6 rounded-full border-2 border-purple-400/30 border-t-purple-400/80 animate-spin" />
          <p className="text-white/30 text-xs tracking-wider"
          >加载中...</p>
        </div>
      </div>
    );
  }

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
      <Settings config={config} onSave={handleSaveConfig} onReplayCelebration={replayCelebration} onLogout={handleLogout} />

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
