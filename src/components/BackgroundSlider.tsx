import { useState, useEffect } from 'react';

export default function BackgroundSlider({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % photos.length);
    }, 8000);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a3e 0%, #1a0a3e 30%, #2d1b4e 60%, #0d0d35 100%)',
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      {/* Fallback gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a3e 0%, #1a0a3e 30%, #2d1b4e 60%, #0d0d35 100%)',
        }}
      />

      {photos.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity duration-[3000ms]"
          style={{
            opacity: i === idx ? 1 : 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: i === idx ? 'kenburns 16s ease-in-out infinite' : 'none',
          }}
        />
      ))}

      {/* Night overlay for atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(10,10,30,0.5) 50%, rgba(5,5,16,0.7) 100%)',
        }}
      />
    </div>
  );
}
