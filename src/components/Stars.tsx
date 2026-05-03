import { useMemo } from 'react';

export default function Stars({ count = 150 }: { count?: number }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 70}%`,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 8,
      duration: Math.random() * 4 + 2,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: `rgba(255,255,255,${Math.random() * 0.5 + 0.3})`,
            boxShadow: `0 0 ${s.size * 3}px rgba(200,210,255,0.4)`,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
