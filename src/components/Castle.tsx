export default function Castle() {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[5] pointer-events-none w-full max-w-[900px]">
      <svg viewBox="0 0 800 300" className="w-full h-auto" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="castleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0a2e" />
            <stop offset="100%" stopColor="#050510" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Main castle silhouette */}
        <path
          d="M0,300 L0,260 L30,260 L30,200 L50,200 L50,180 L70,180 L70,200 L90,200 L90,260 L120,260 L120,160 L140,140 L160,160 L160,220 L180,220 L180,120 L200,90 L220,120 L220,220 L240,220 L240,160 L260,140 L280,160 L280,240 L310,240 L310,150 L340,100 L360,60 L380,100 L400,150 L400,240 L430,240 L430,160 L450,140 L470,160 L470,220 L490,220 L490,120 L510,90 L530,120 L530,220 L550,220 L550,160 L570,140 L590,160 L590,260 L620,260 L620,200 L640,200 L640,180 L660,180 L660,200 L680,200 L680,260 L710,260 L710,220 L730,200 L750,220 L750,260 L800,260 L800,300 Z"
          fill="url(#castleGrad)"
        />

        {/* Glowing windows */}
        <rect x="345" y="120" width="8" height="14" rx="4" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />
        <rect x="365" y="110" width="8" height="14" rx="4" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 4s ease-in-out 1s infinite' }} />
        <rect x="385" y="125" width="6" height="10" rx="3" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 3s ease-in-out 0.5s infinite' }} />
        <rect x="200" y="140" width="6" height="10" rx="3" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 5s ease-in-out 2s infinite' }} />
        <rect x="510" y="140" width="6" height="10" rx="3" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 5s ease-in-out 1.5s infinite' }} />
        <rect x="140" y="180" width="5" height="8" rx="2" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 4s ease-in-out 3s infinite' }} />
        <rect x="570" y="180" width="5" height="8" rx="2" fill="url(#windowGlow)"
          style={{ animation: 'glow-pulse 4s ease-in-out 2.5s infinite' }} />

        {/* Main tower spire */}
        <polygon points="360,60 355,90 365,90" fill="#0a0a2e" />
        <circle cx="360" cy="55" r="3" fill="#ffd700"
          style={{ animation: 'glow-pulse 2s ease-in-out infinite' }} />

        {/* Water reflection */}
        <path
          d="M0,300 L800,300 L800,305 Q700,308 600,305 Q500,302 400,305 Q300,308 200,305 Q100,302 0,305 Z"
          fill="rgba(100,80,180,0.15)"
        />
      </svg>
    </div>
  );
}
