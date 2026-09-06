import React from 'react';

// Modern 3D Illustrative Vector Components (Zero raster images, crisp vector geometry, rich lighting and shadows)

export const Illustration3DCalendar: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="calGrad" x1="20" y1="20" x2="100" y2="105" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7d45" />
        <stop offset="100%" stopColor="#ff4500" />
      </linearGradient>
      <linearGradient id="sheetGrad" x1="30" y1="35" x2="90" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f0f2f5" />
      </linearGradient>
      <filter id="calShadow" x="10" y="20" width="100" height="95" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ff4500" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Base 3D Body */}
    <rect x="22" y="26" width="76" height="74" rx="22" fill="url(#calGrad)" filter="url(#calShadow)" />
    {/* Calendar White Sheet */}
    <rect x="22" y="44" width="76" height="56" rx="18" fill="url(#sheetGrad)" />
    {/* Top Binder Rings */}
    <rect x="36" y="16" width="8" height="18" rx="4" fill="#ffffff" />
    <rect x="76" y="16" width="8" height="18" rx="4" fill="#ffffff" />
    {/* Date Marker (Number / Shape) */}
    <rect x="42" y="58" width="36" height="6" rx="3" fill="#ff5e1a" />
    <rect x="42" y="70" width="24" height="6" rx="3" fill="#cbd5e1" />
    <circle cx="76" cy="73" r="5" fill="#ff5e1a" />
  </svg>
);

export const Illustration3DChecklist: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boardGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2c303e" />
        <stop offset="100%" stopColor="#151722" />
      </linearGradient>
      <linearGradient id="checkGlow" x1="45" y1="45" x2="85" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a3d" />
        <stop offset="100%" stopColor="#ff4900" />
      </linearGradient>
      <filter id="checkShadow" x="10" y="20" width="100" height="95" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ff4900" floodOpacity="0.3" />
      </filter>
    </defs>
    {/* 3D Clipboard Backing */}
    <rect x="24" y="20" width="72" height="82" rx="22" fill="url(#boardGrad)" />
    {/* Top Metallic Clip */}
    <rect x="46" y="12" width="28" height="14" rx="6" fill="#475569" />
    <rect x="52" y="15" width="16" height="6" rx="3" fill="#94a3b8" />
    {/* 3D Circular Orange Check Orb */}
    <circle cx="60" cy="62" r="26" fill="url(#checkGlow)" filter="url(#checkShadow)" />
    {/* Thick White Check Icon */}
    <path d="M48 62 L56 70 L73 53" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Illustration3DShopping: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cartBackGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a3d" />
        <stop offset="100%" stopColor="#e54c09" />
      </linearGradient>
      <linearGradient id="basketGrad" x1="30" y1="35" x2="90" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <filter id="cartShadow" x="12" y="16" width="96" height="96" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#e54c09" floodOpacity="0.28" />
      </filter>
    </defs>
    {/* 3D Base Card */}
    <rect x="22" y="24" width="76" height="74" rx="22" fill="url(#cartBackGrad)" filter="url(#cartShadow)" />
    {/* Cart Handle */}
    <path d="M35 44 H42 L49 70 H78 L85 48 H45" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Cart Basket Body */}
    <path d="M44 50 H83 L77 68 H50 Z" fill="url(#basketGrad)" opacity="0.95" />
    {/* Front Cart Grid Lines */}
    <path d="M53 52 V66 M61 52 V66 M69 52 V66" stroke="#ff5e1a" strokeWidth="2.5" strokeLinecap="round" />
    {/* Wheels */}
    <circle cx="53" cy="79" r="5" fill="#ffffff" />
    <circle cx="53" cy="79" r="2.5" fill="#e54c09" />
    <circle cx="75" cy="79" r="5" fill="#ffffff" />
    <circle cx="75" cy="79" r="2.5" fill="#e54c09" />
  </svg>
);

export const Illustration3DMatrix: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cube1" x1="20" y1="20" x2="55" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff6d2e" />
        <stop offset="100%" stopColor="#e64000" />
      </linearGradient>
      <linearGradient id="cube2" x1="65" y1="20" x2="100" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4f566b" />
        <stop offset="100%" stopColor="#2e3344" />
      </linearGradient>
      <linearGradient id="cube3" x1="20" y1="65" x2="55" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="cube4" x1="65" y1="65" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#7e22ce" />
      </linearGradient>
    </defs>
    {/* 4 Floating 3D Cubes/Pills representing Quadrants */}
    <rect x="22" y="22" width="34" height="34" rx="12" fill="url(#cube1)" />
    <rect x="64" y="22" width="34" height="34" rx="12" fill="url(#cube2)" />
    <rect x="22" y="64" width="34" height="34" rx="12" fill="url(#cube3)" />
    <rect x="64" y="64" width="34" height="34" rx="12" fill="url(#cube4)" />
    <circle cx="39" cy="39" r="5" fill="#ffffff" />
  </svg>
);

export const Illustration3DFinance: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="walletBase" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="walletFlap" x1="25" y1="35" x2="95" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="goldCoin" x1="45" y1="35" x2="85" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="finShadow" x="12" y="18" width="96" height="92" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#059669" floodOpacity="0.32" />
      </filter>
    </defs>
    {/* 3D Wallet Body */}
    <rect x="22" y="28" width="76" height="66" rx="20" fill="url(#walletBase)" filter="url(#finShadow)" />
    {/* Front Flap / Bill Fold */}
    <path d="M22 46 C22 46 45 42 60 42 C75 42 98 46 98 46 V84 C98 89.5 93.5 94 88 94 H32 C26.5 94 22 89.5 22 84 Z" fill="url(#walletFlap)" />
    {/* Card Slip */}
    <rect x="34" y="22" width="40" height="12" rx="4" fill="#6ee7b7" opacity="0.8" />
    {/* Center 3D Rupee / Gold Seal */}
    <circle cx="60" cy="65" r="16" fill="url(#goldCoin)" />
    <circle cx="60" cy="65" r="13" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 1.5" />
    {/* Rupee Symbol ₹ */}
    <path d="M55 59 H65 M55 63 H63 M55 59 C59 59 62 60 62 63 C62 66 59 67 55 67 L64 73" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Illustration3DNotes: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="noteCover" x1="20" y1="20" x2="95" y2="105" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
      <linearGradient id="penGrad" x1="70" y1="20" x2="105" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a3d" />
        <stop offset="100%" stopColor="#ff4500" />
      </linearGradient>
    </defs>
    {/* 3D Journal */}
    <rect x="24" y="24" width="66" height="76" rx="18" fill="url(#noteCover)" />
    <rect x="30" y="24" width="8" height="76" fill="#5b21b6" />
    <rect x="46" y="44" width="34" height="6" rx="3" fill="#ffffff" opacity="0.9" />
    <rect x="46" y="56" width="24" height="6" rx="3" fill="#ffffff" opacity="0.6" />
    {/* Floating 3D Stylus */}
    <rect x="74" y="28" width="10" height="42" rx="5" transform="rotate(35 74 28)" fill="url(#penGrad)" />
  </svg>
);

export const Illustration3DNotepad: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="padGrad" x1="20" y1="20" x2="95" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect x="26" y="22" width="68" height="78" rx="20" fill="url(#padGrad)" />
    <circle cx="44" cy="38" r="4" fill="#ffffff" />
    <circle cx="60" cy="38" r="4" fill="#ffffff" />
    <circle cx="76" cy="38" r="4" fill="#ffffff" />
    <rect x="38" y="54" width="44" height="6" rx="3" fill="#ffffff" opacity="0.8" />
    <rect x="38" y="68" width="32" height="6" rx="3" fill="#ffffff" opacity="0.8" />
    <rect x="38" y="80" width="20" height="6" rx="3" fill="#ffffff" opacity="0.5" />
  </svg>
);

export const Illustration3DMindMap: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mmCenter" x1="40" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a3d" />
        <stop offset="100%" stopColor="#ff4500" />
      </linearGradient>
      <linearGradient id="mmNode1" x1="15" y1="25" x2="45" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
      <linearGradient id="mmNode2" x1="75" y1="20" x2="105" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="mmNode3" x1="75" y1="70" x2="105" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="mmNode4" x1="15" y1="65" x2="45" y2="95" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="mmShadow" x="10" y="10" width="100" height="100" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#ff4500" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Connecting Curved Lines */}
    <path d="M60 60 C40 60 40 40 30 40" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M60 60 C80 60 80 35 90 35" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M60 60 C80 60 80 85 90 85" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M60 60 C40 60 40 80 30 80" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />

    {/* Outer Branch Nodes */}
    <circle cx="30" cy="40" r="12" fill="url(#mmNode1)" />
    <circle cx="90" cy="35" r="12" fill="url(#mmNode2)" />
    <circle cx="90" cy="85" r="12" fill="url(#mmNode3)" />
    <circle cx="30" cy="80" r="12" fill="url(#mmNode4)" />

    {/* Center Root Orb */}
    <circle cx="60" cy="60" r="18" fill="url(#mmCenter)" filter="url(#mmShadow)" />
    <circle cx="60" cy="60" r="10" fill="#ffffff" opacity="0.9" />
    <circle cx="60" cy="60" r="5" fill="#ff5e1a" />
  </svg>
);
