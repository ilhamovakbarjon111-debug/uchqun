import React from 'react';

/**
 * SuperAdminBackground - Premium executive theme
 * Features: Dark slate gradient, gold accents, luxury feel
 */
const SuperAdminBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Main gradient - Soft slate with subtle warmth */}
          <linearGradient id="superAdminGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="30%" stopColor="#F8FAFC" />
            <stop offset="70%" stopColor="#FEFCE8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0.2" />
          </linearGradient>

          {/* Gold accent */}
          <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.05" />
          </linearGradient>

          {/* Slate accent */}
          <linearGradient id="darkSlateAccent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.05" />
          </linearGradient>

          {/* Premium radial for corner */}
          <radialGradient id="premiumGlow" cx="100%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#D97706" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          {/* Diamond pattern */}
          <pattern id="diamondPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.06" />
          </pattern>
        </defs>

        {/* Main background */}
        <rect x="0" y="0" width="1920" height="1080" fill="url(#superAdminGradient)" />

        {/* Diamond pattern overlay */}
        <rect x="0" y="0" width="1920" height="1080" fill="url(#diamondPattern)" opacity="0.4" />

        {/* Top-right premium glow */}
        <rect x="0" y="0" width="1920" height="1080" fill="url(#premiumGlow)" />

        {/* Left slate accent panel */}
        <path
          d="M0 0 L300 0 L200 1080 L0 1080 Z"
          fill="url(#darkSlateAccent)"
        />

        {/* Bottom-right gold accent */}
        <path
          d="M1400 1080 L1920 800 L1920 1080 Z"
          fill="url(#goldAccent)"
        />

        {/* Decorative gold line - top */}
        <line x1="300" y1="100" x2="800" y2="100" stroke="#D97706" strokeWidth="2" opacity="0.1" />
        <line x1="300" y1="105" x2="700" y2="105" stroke="#D97706" strokeWidth="1" opacity="0.08" />

        {/* Decorative slate line - bottom */}
        <line x1="1100" y1="950" x2="1600" y2="950" stroke="#334155" strokeWidth="2" opacity="0.08" />
        <line x1="1200" y1="955" x2="1600" y2="955" stroke="#334155" strokeWidth="1" opacity="0.06" />

        {/* Premium corner accent - top right */}
        <path
          d="M1920 0 L1920 200 L1720 0 Z"
          fill="#D97706"
          opacity="0.06"
        />
        <path
          d="M1920 0 L1920 150 L1770 0 Z"
          fill="#F59E0B"
          opacity="0.04"
        />

        {/* Premium corner accent - bottom left */}
        <path
          d="M0 1080 L0 880 L200 1080 Z"
          fill="#334155"
          opacity="0.05"
        />

        {/* Floating diamond shapes */}
        <path d="M500 300 L530 330 L500 360 L470 330 Z" fill="#D97706" opacity="0.08" />
        <path d="M1400 400 L1420 420 L1400 440 L1380 420 Z" fill="#D97706" opacity="0.1" />
        <path d="M800 600 L820 620 L800 640 L780 620 Z" fill="#334155" opacity="0.06" />
        <path d="M1600 700 L1625 725 L1600 750 L1575 725 Z" fill="#F59E0B" opacity="0.08" />

        {/* Subtle circles */}
        <circle cx="400" cy="200" r="80" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.06" />
        <circle cx="400" cy="200" r="50" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.04" />
        <circle cx="1500" cy="850" r="100" fill="none" stroke="#334155" strokeWidth="1" opacity="0.05" />
        <circle cx="1500" cy="850" r="60" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.03" />

        {/* Small gold dots */}
        <circle cx="600" cy="400" r="4" fill="#D97706" opacity="0.2" />
        <circle cx="1300" cy="300" r="5" fill="#F59E0B" opacity="0.15" />
        <circle cx="900" cy="200" r="3" fill="#D97706" opacity="0.18" />
        <circle cx="1100" cy="600" r="4" fill="#334155" opacity="0.12" />
        <circle cx="700" cy="800" r="5" fill="#D97706" opacity="0.14" />
        <circle cx="1700" cy="500" r="4" fill="#F59E0B" opacity="0.16" />
      </svg>

      {/* Premium overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(251,191,36,0.01) 100%)',
          zIndex: 1
        }}
      />
    </div>
  );
};

export default SuperAdminBackground;
