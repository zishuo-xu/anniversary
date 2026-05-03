import { useEffect, useState, useMemo } from 'react';

interface Props {
  milestone: number;
  active: boolean;
  photos: string[];
}

type Phase =
  | 'hidden'
  | 'card-enter'
  | 'card-show'
  | 'card-exit'
  | 'slides-enter'
  | 'slides-show'
  | 'slides-exit';

const QUOTES = [
  '遇见你，是所有故事的开始',
  '愿岁月可回首，且以深情共白头',
  '山河远阔，人间烟火，无一是你，无一不是你',
  '春风十里，不如你',
  '余生漫漫，有你就好',
  '你是我绕过山河错落，才找到的人间烟火',
  '日落尤其温柔，人间皆是浪漫',
  '世界一般，但你超值',
  '星星醉酒到处跑，月亮跌进深海里，我从未觉得人间美好，直到你来了',
  '我想和你互相浪费，一起虚度短的沉默，长的无意义',
];

function usePhaseTimer(active: boolean) {
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    if (!active) {
      setPhase('hidden');
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('card-enter'), 0));
    timers.push(setTimeout(() => setPhase('card-show'), 1200));
    timers.push(setTimeout(() => setPhase('card-exit'), 10000));
    timers.push(setTimeout(() => setPhase('slides-enter'), 11200));
    timers.push(setTimeout(() => setPhase('slides-show'), 12400));
    timers.push(setTimeout(() => setPhase('slides-exit'), 50000));
    timers.push(setTimeout(() => setPhase('hidden'), 54000));

    return () => timers.forEach(clearTimeout);
  }, [active]);

  return phase;
}

export default function CelebrationOverlay({ milestone, active, photos }: Props) {
  const phase = usePhaseTimer(active);
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = useMemo(() => {
    if (photos.length === 0) return [];
    return photos.map((src, i) => ({
      src,
      quote: QUOTES[i % QUOTES.length],
    }));
  }, [photos]);

  useEffect(() => {
    if (slides.length === 0) return;
    if (phase !== 'slides-show' && phase !== 'slides-enter') return;

    const id = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [phase, slides.length]);

  useEffect(() => {
    if (phase === 'slides-enter' || phase === 'slides-show') {
      setSlideIdx(0);
    }
  }, [phase]);

  const showCard =
    phase === 'card-enter' || phase === 'card-show' || phase === 'card-exit';
  const showSlides =
    phase === 'slides-enter' || phase === 'slides-show' || phase === 'slides-exit';

  if (phase === 'hidden') return null;

  const cardOpacity =
    phase === 'card-enter' ? 0 : phase === 'card-exit' ? 0 : 1;
  const cardScale =
    phase === 'card-enter'
      ? 0.4
      : phase === 'card-exit'
        ? 0.92
        : 1;
  const cardY =
    phase === 'card-enter' ? 30 : phase === 'card-exit' ? -40 : 0;
  const cardBlur =
    phase === 'card-enter' ? 16 : phase === 'card-exit' ? 8 : 0;

  const slidesOpacity =
    phase === 'slides-enter' ? 0 : phase === 'slides-exit' ? 0 : 1;
  const slidesScale =
    phase === 'slides-enter' ? 1.08 : phase === 'slides-exit' ? 0.95 : 1;

  return (
    <div className="fixed inset-0 z-[20] flex items-center justify-center pointer-events-none">
      {/* Ambient backdrop glow */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          opacity: showCard
            ? phase === 'card-enter'
              ? 0.6
              : 0.4
            : showSlides
              ? 0.3
              : 0,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,200,80,0.12) 0%, rgba(200,100,255,0.06) 40%, transparent 70%)',
        }}
      />

      {/* Card phase */}
      {showCard && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transition: 'all 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: cardOpacity,
            transform: `scale(${cardScale}) translateY(${cardY}px)`,
            filter: `blur(${cardBlur}px)`,
            pointerEvents: 'none',
          }}
        >
          <div
            className="relative flex flex-col items-center px-10 py-8 sm:px-16 sm:py-12 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow:
                '0 0 60px rgba(255,200,100,0.08), 0 0 120px rgba(200,100,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(255,220,120,0.06) 0%, transparent 60%)',
                animation:
                  phase === 'card-show'
                    ? 'glow-pulse 4s ease-in-out infinite'
                    : 'none',
              }}
            />

            <div
              className="w-12 h-px mb-6"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,220,120,0.5), transparent)',
                transition: 'opacity 1s ease 0.5s',
                opacity: phase === 'card-show' ? 1 : 0,
              }}
            />

            <span
              className="font-serif tabular-nums block text-center"
              style={{
                fontSize: 'clamp(3.5rem, 12vw, 8rem)',
                fontWeight: 300,
                lineHeight: 1.1,
                color: '#fff',
                textShadow:
                  '0 0 20px rgba(255,220,120,0.6), 0 0 60px rgba(255,150,200,0.35), 0 0 120px rgba(150,80,255,0.2), 0 4px 20px rgba(0,0,0,0.5)',
                letterSpacing: '0.08em',
                animation:
                  phase === 'card-show'
                    ? 'float 6s ease-in-out infinite'
                    : 'none',
              }}
            >
              {milestone} 天
            </span>

            <p
              className="mt-4 font-light tracking-[0.3em] text-center"
              style={{
                fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                color: 'rgba(255,255,255,0.45)',
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
                transition: 'all 1s ease 0.8s',
                opacity: phase === 'card-show' ? 1 : 0,
                transform:
                  phase === 'card-show'
                    ? 'translateY(0)'
                    : 'translateY(10px)',
              }}
            >
              每一个纪念日，都是爱的印记
            </p>

            <div
              className="w-12 h-px mt-6"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,220,120,0.5), transparent)',
                transition: 'opacity 1s ease 1s',
                opacity: phase === 'card-show' ? 1 : 0,
              }}
            />
          </div>
        </div>
      )}

      {/* Slideshow phase */}
      {showSlides && slides.length > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transition: 'all 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: slidesOpacity,
            transform: `scale(${slidesScale})`,
          }}
        >
          {slides.map((s, i) => (
            <div
              key={`${s.src}-${i}`}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                opacity: i === slideIdx ? 1 : 0,
                transition: 'opacity 2s ease-in-out',
                pointerEvents: 'none',
              }}
            >
              {/* Photo */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: 'min(70vw, 520px)',
                  aspectRatio: '4/5',
                  boxShadow:
                    '0 0 40px rgba(255,200,100,0.1), 0 0 80px rgba(150,80,255,0.06), 0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={s.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    animation:
                      i === slideIdx && phase === 'slides-show'
                        ? 'kenburns 10s ease-in-out infinite alternate'
                        : 'none',
                  }}
                />
                {/* Vignette overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%)',
                  }}
                />
              </div>

              {/* Quote */}
              <p
                className="mt-6 font-light text-center px-6"
                style={{
                  fontSize: 'clamp(0.85rem, 2.2vw, 1.15rem)',
                  color: 'rgba(255,255,255,0.7)',
                  textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                  letterSpacing: '0.15em',
                  lineHeight: 1.8,
                  maxWidth: 'min(70vw, 520px)',
                }}
              >
                {s.quote}
              </p>
            </div>
          ))}

          {/* Progress dots */}
          <div className="absolute bottom-10 flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background:
                    i === slideIdx
                      ? 'rgba(255,220,120,0.8)'
                      : 'rgba(255,255,255,0.2)',
                  transform: i === slideIdx ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback when no photos */}
      {showSlides && slides.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transition: 'all 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: slidesOpacity,
          }}
        >
          <p
            className="font-light text-center px-6"
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.2em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            时光不老，我们不散
          </p>
        </div>
      )}
    </div>
  );
}
