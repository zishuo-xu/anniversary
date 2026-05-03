import { useState, useCallback } from 'react';
import type { TimelineEvent } from '../types';
import TimelineForm from './TimelineForm';

interface Props {
  events: TimelineEvent[];
  startDate: string;
  onSave: (events: TimelineEvent[]) => void;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return { year, month, day, weekday: weekdays[d.getDay()] };
}

function daysSince(startIso: string, eventDate: string) {
  const start = new Date(startIso);
  const ev = new Date(eventDate + 'T00:00:00');
  if (ev < start) return 0;
  return Math.floor((ev.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function Timeline({ events, startDate, onSave, onClose }: Props) {
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sorted = [...events].sort((a, b) =>
    new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime()
  );

  const handleDelete = useCallback((id: string) => {
    if (!confirm('确定要删除这段回忆吗？')) return;
    onSave(events.filter((e) => e.id !== id));
  }, [events, onSave]);

  const handleFormSave = useCallback((ev: TimelineEvent) => {
    if (editing) {
      onSave(events.map((e) => (e.id === ev.id ? ev : e)));
    } else {
      onSave([...events, ev]);
    }
    setShowForm(false);
    setEditing(null);
  }, [events, editing, onSave]);

  return (
    <div className="fixed inset-0 z-[50] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 40%, #2d1b4e 80%, #0d0d35 100%)',
      }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,46,0.95) 0%, rgba(10,10,46,0) 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
        <h2 className="text-white/70 text-base font-light tracking-[0.3em]">我们的时间线</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
          aria-label="添加回忆"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Timeline body */}
      <div className="flex-1 overflow-y-auto px-4 pb-12" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        <div className="max-w-lg mx-auto pt-4">
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-white/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-30">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm tracking-wider">还没有记录任何回忆</p>
              <p className="text-xs mt-2 tracking-wider">点击右上角 + 添加第一段故事</p>
            </div>
          )}

          {sorted.map((ev, idx) => {
            const { year, month, day, weekday } = formatDate(ev.date);
            const dayNum = daysSince(startDate, ev.date);

            return (
              <div key={ev.id} className="relative flex gap-4 mb-8 last:mb-0">
                {/* Left column: date */}
                <div className="flex flex-col items-end w-16 shrink-0 pt-1">
                  <span className="text-white/20 text-[10px] tracking-wider">{year}</span>
                  <span className="text-white/50 text-lg font-light tabular-nums">{month}.{day}</span>
                  <span className="text-white/20 text-[10px] tracking-wider">{weekday}</span>
                  <span className="text-amber-300/40 text-[10px] mt-1 tracking-wider">第{dayNum}天</span>
                </div>

                {/* Connector line */}
                <div className="relative flex flex-col items-center shrink-0">
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      borderColor: 'rgba(255,220,120,0.6)',
                      background: 'rgba(255,220,120,0.15)',
                      boxShadow: '0 0 10px rgba(255,220,120,0.3)',
                    }}
                  />
                  {idx !== sorted.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'linear-gradient(180deg, rgba(255,220,120,0.15), rgba(255,220,120,0.03))' }} />
                  )}
                </div>

                {/* Right column: card */}
                <div className="flex-1 min-w-0 pb-4">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-white/80 text-sm font-medium tracking-wide">{ev.title}</h3>
                        {ev.location && (
                          <p className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {ev.location}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditing(ev); setShowForm(true); }}
                          className="p-1.5 rounded-full hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-white/20 hover:text-red-300/60 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-white/35 text-xs mt-2 leading-relaxed">{ev.description}</p>
                    )}

                    {ev.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        {ev.photos.map((src, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-white/5">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom anchor: start of story */}
          {sorted.length > 0 && (
            <div className="flex gap-4 items-center mt-4">
              <div className="w-16 shrink-0" />
              <div className="relative flex flex-col items-center shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,220,120,0.3)' }} />
              </div>
              <p className="text-white/15 text-xs tracking-wider">我们的故事，从这里开始</p>
            </div>
          )}
        </div>
      </div>

      {/* Form overlay */}
      {showForm && (
        <TimelineForm
          event={editing}
          onSave={handleFormSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
