import React from 'react';

// SVG Logo matching the Sportika brand identity:
// Blue globe + orange/green gradient runner + golden orbit ring + sparkle stars

interface SportikaLogoProps {
  size?: number;        // icon size in px
  showText?: boolean;   // show SPORTIKA + GLOBAL SPORTSWEAR text
  textColor?: string;   // text color override (for dark backgrounds)
  horizontal?: boolean; // icon left, text right layout
}

export default function SportikaLogo({
  size = 48,
  showText = true,
  textColor,
  horizontal = false,
}: SportikaLogoProps) {
  const id = `logo_${size}`;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: 'center',
        gap: horizontal ? size * 0.2 : size * 0.1,
        userSelect: 'none',
      }}
    >
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sportika Logo"
      >
        <defs>
          <radialGradient id={`globe_${id}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </radialGradient>
          <linearGradient id={`runner_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C853" />
            <stop offset="50%" stopColor="#AEEA00" />
            <stop offset="100%" stopColor="#FF6D00" />
          </linearGradient>
          <linearGradient id={`orbit_${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6D00" />
            <stop offset="100%" stopColor="#FFD600" />
          </linearGradient>
          <filter id={`glow_${id}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Globe body */}
        <circle cx="50" cy="48" r="32" fill={`url(#globe_${id})`} />

        {/* Globe grid lines */}
        <ellipse cx="50" cy="48" rx="32" ry="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <line x1="50" y1="16" x2="50" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <line x1="18" y1="48" x2="82" y2="48" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

        {/* Continents (simplified shapes) */}
        <path d="M34 34 Q38 28 45 32 Q47 36 43 38 Q38 40 34 34Z" fill="#2E7D32" opacity="0.85" />
        <path d="M52 30 Q58 26 64 30 Q68 36 63 40 Q57 42 52 38 Z" fill="#2E7D32" opacity="0.85" />
        <path d="M36 50 Q40 46 46 50 Q48 56 42 58 Q37 56 36 50Z" fill="#388E3C" opacity="0.85" />
        <path d="M55 52 Q60 48 66 52 Q67 58 62 60 Q56 58 55 52Z" fill="#2E7D32" opacity="0.85" />

        {/* Orbit ring — back portion */}
        <ellipse cx="50" cy="48" rx="42" ry="10" fill="none"
          stroke={`url(#orbit_${id})`} strokeWidth="3" strokeDasharray="100 32"
          strokeDashoffset="0" opacity="0.5" />

        {/* Runner figure */}
        <g filter={`url(#glow_${id})`} fill={`url(#runner_${id})`}>
          {/* Head */}
          <circle cx="62" cy="26" r="5" />
          {/* Body */}
          <path d="M62 31 L58 45 L53 55" stroke={`url(#runner_${id})`} strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Front arm */}
          <path d="M60 37 L50 32" stroke={`url(#runner_${id})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Back arm */}
          <path d="M60 37 L68 43" stroke={`url(#runner_${id})`} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          {/* Front leg */}
          <path d="M58 45 L52 57 L46 62" stroke={`url(#runner_${id})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Back leg */}
          <path d="M58 45 L66 52 L70 60" stroke={`url(#runner_${id})`} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>

        {/* Orbit ring — front portion */}
        <ellipse cx="50" cy="48" rx="42" ry="10" fill="none"
          stroke={`url(#orbit_${id})`} strokeWidth="3" strokeDasharray="32 100"
          strokeDashoffset="0" />

        {/* Sparkle stars */}
        {[
          { x: 14, y: 22, s: 3 },
          { x: 84, y: 20, s: 2.5 },
          { x: 88, y: 60, s: 2 },
          { x: 10, y: 62, s: 2 },
          { x: 78, y: 80, s: 1.8 },
        ].map((star, i) => (
          <g key={i} transform={`translate(${star.x},${star.y})`}>
            <path
              d={`M0,-${star.s} L${star.s * 0.25},-${star.s * 0.25} L${star.s},0 L${star.s * 0.25},${star.s * 0.25} L0,${star.s} L-${star.s * 0.25},${star.s * 0.25} L-${star.s},0 L-${star.s * 0.25},-${star.s * 0.25} Z`}
              fill="#FFD600"
              opacity={0.9}
            />
          </g>
        ))}
      </svg>

      {/* Text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: horizontal ? 'flex-start' : 'center', gap: 1 }}>
          {/* SPORTIKA gradient text */}
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: horizontal ? size * 0.52 : size * 0.44,
              lineHeight: 1,
              letterSpacing: horizontal ? '0.05em' : '0.08em',
              background: 'linear-gradient(90deg, #1565C0 0%, #00C853 45%, #FF6D00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SPORTIKA
          </span>
          {/* GLOBAL SPORTSWEAR subtitle */}
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: horizontal ? size * 0.2 : size * 0.17,
              letterSpacing: '0.18em',
              color: textColor || '#8896B3',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            Global Sportswear
          </span>
        </div>
      )}
    </div>
  );
}
