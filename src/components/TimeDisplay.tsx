import { useTimer } from '../hooks/useTimer';
import type { Config } from '../types';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function TimeDisplay({ config }: { config: Config }) {
  const diff = useTimer(config.startDateTime);
  const start = new Date(config.startDateTime);

  const dateStr = `${start.getFullYear()}年${pad(start.getMonth() + 1)}月${pad(start.getDate())}日`;
  const timeStr = start.getHours() !== 0 || start.getMinutes() !== 0
    ? ` ${pad(start.getHours())}:${pad(start.getMinutes())}`
    : '';

  const glowText = {
    textShadow: '0 0 20px rgba(255,215,100,0.6), 0 0 60px rgba(255,150,200,0.4), 0 0 100px rgba(150,100,255,0.2), 0 2px 10px rgba(0,0,0,0.6)',
  };

  const glowNumber = {
    textShadow: '0 0 30px rgba(255,220,120,0.8), 0 0 80px rgba(255,150,200,0.5), 0 0 140px rgba(150,80,255,0.3), 0 4px 20px rgba(0,0,0,0.7)',
  };

  return (
    <div className="relative z-[10] flex flex-col items-center text-center px-4"
      style={{ animation: 'slide-up 1.2s ease-out' }}
    >
      {/* Ambient glow behind numbers */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,200,100,0.12) 0%, rgba(200,100,255,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'glow-pulse 6s ease-in-out infinite',
        }}
      />

      {/* Title */}
      <h1 className="font-serif text-white mb-3 tracking-wider relative"
        style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
          fontWeight: 400,
          ...glowText,
        }}
      >
        {config.title}
      </h1>

      {config.subtitle && (
        <p className="text-white/50 text-sm mb-8 tracking-widest font-light relative"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          {config.subtitle}
        </p>
      )}

      {/* Date display */}
      <p className="text-white/30 text-xs mb-10 tracking-[0.25em] relative"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
      >
        {dateStr}{timeStr}
      </p>

      {/* Main timer */}
      <div className="flex flex-col items-center gap-3 relative"
        style={{ animation: 'float 8s ease-in-out infinite' }}
      >
        {/* Years / Months / Days */}
        {(diff.years > 0 || diff.months > 0 || diff.days > 0) && (
          <div className="flex items-baseline gap-3 sm:gap-4 text-white/90">
            {diff.years > 0 && (
              <>
                <span className="font-light tabular-nums" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', ...glowText }}>{diff.years}</span>
                <span className="text-white/40 text-sm sm:text-base">年</span>
              </>
            )}
            {diff.months > 0 && (
              <>
                <span className="font-light tabular-nums" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', ...glowText }}>{diff.months}</span>
                <span className="text-white/40 text-sm sm:text-base">个月</span>
              </>
            )}
            <span className="font-light tabular-nums" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', ...glowText }}>{diff.days}</span>
            <span className="text-white/40 text-sm sm:text-base">天</span>
          </div>
        )}

        {/* Hours : Minutes : Seconds */}
        <div className="flex items-center gap-2 sm:gap-4">
          {[
            { v: diff.hours, l: '时' },
            { v: diff.minutes, l: '分' },
            { v: diff.seconds, l: '秒' },
          ].map((u, idx) => (
            <div key={u.l} className="flex items-center">
              {idx > 0 && (
                <span
                  className="tabular-nums leading-none mx-1 sm:mx-2 select-none"
                  style={{
                    fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                    fontWeight: 100,
                    color: 'rgba(255,255,255,0.35)',
                    textShadow: '0 0 20px rgba(255,200,100,0.3)',
                    animation: 'glow-pulse 2s ease-in-out infinite',
                  }}
                >
                  :
                </span>
              )}
              <div className="flex flex-col items-center">
                <span
                  className="tabular-nums leading-none"
                  style={{
                    fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                    fontWeight: 200,
                    color: '#fff',
                    ...glowNumber,
                  }}
                >
                  {pad(u.v)}
                </span>
                <span className="text-white/30 text-xs sm:text-sm mt-2 sm:mt-3 tracking-[0.2em]">{u.l}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total days */}
        <p className="text-white/50 mt-8 tracking-[0.3em] font-light"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
            textShadow: '0 0 15px rgba(255,220,120,0.3), 0 0 40px rgba(255,150,200,0.15), 0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          第{' '}
          <span
            className="font-medium tabular-nums"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              color: '#fff',
              ...glowNumber,
            }}
          >
            {diff.totalDays + 1}
          </span>
          {' '}天
        </p>
      </div>

      {/* Signature */}
      {config.signature && (
        <p className="text-white/40 italic mt-12 text-base tracking-wider relative"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          {config.signature}
        </p>
      )}

      {/* Bottom hint */}
      <p className="text-white/10 text-[10px] mt-10 tracking-[0.4em] uppercase relative">
        Time keeps going
      </p>
    </div>
  );
}
