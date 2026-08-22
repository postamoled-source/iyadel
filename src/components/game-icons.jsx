// 3D-style game emblems — free-floating, no boxes. One distinct gradient per game.
const SHADOW = { filter: "drop-shadow(0 6px 9px hsl(var(--primary) / 0.35))" };

function Snake({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none">
      <defs>
        <radialGradient id="gmsnkBody" cx="35%" cy="25%" r="80%" fx="30%" fy="20%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="45%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#065f46" />
        </radialGradient>
        <radialGradient id="gmsnkHead" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
        <linearGradient id="gmsnkBelly" x1="0" y1="40" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {/* belly highlight under the body */}
      <path d="M14 54 C14 41 29 43 29 29 C29 18 43 17 45 30" stroke="url(#gmsnkBelly)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      {/* main 3D coiled body */}
      <path d="M16 52 C16 40 30 42 30 30 C30 18 44 18 44 30" stroke="url(#gmsnkBody)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      {/* scale ridge highlight */}
      <path d="M17 49 C18 39 30 40 30 31 C30 20 43 20 43 30" stroke="#fff" strokeOpacity="0.35" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* head */}
      <circle cx="44" cy="23" r="11" fill="url(#gmsnkHead)" />
      <circle cx="48" cy="19" r="2.6" fill="#0f172a" />
      <circle cx="49" cy="18" r="0.9" fill="#fff" />
      {/* forked tongue */}
      <path d="M50 23 q5 1 7 -3" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M55 21 l2 1 M57 20 l1 2" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Game2048({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gm2048" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="gm2048b" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#3b2a8c" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="24" height="24" rx="6" fill="url(#gm2048b)" />
      <rect x="34" y="6" width="24" height="24" rx="6" fill="url(#gm2048b)" />
      <rect x="6" y="34" width="24" height="24" rx="6" fill="url(#gm2048b)" />
      <rect x="34" y="34" width="24" height="24" rx="6" fill="url(#gm2048)" />
      <text x="18" y="24" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">2</text>
      <text x="46" y="24" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">4</text>
      <text x="18" y="52" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">8</text>
      <text x="46" y="52" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">16</text>
    </svg>
  );
}

function MemoryMatch({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gmmem1" x1="0" y1="0" x2="0" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="gmmem2" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <g transform="rotate(-10 22 36)">
        <rect x="8" y="18" width="28" height="36" rx="6" fill="url(#gmmem1)" />
        <circle cx="22" cy="36" r="6" fill="#fff" opacity="0.85" />
      </g>
      <g transform="rotate(12 42 28)">
        <rect x="28" y="10" width="28" height="36" rx="6" fill="url(#gmmem2)" />
        <path d="M42 22 l4 4 8 -8" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function Whack({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <radialGradient id="gmwhkHead" cx="38%" cy="28%" r="78%" fx="32%" fy="22%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="50%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
        <linearGradient id="gmwhkHammer" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="55%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="gmwhkHandle" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      {/* hammer shaft with wood grain */}
      <g transform="rotate(40 26 20)">
        <rect x="22" y="22" width="8" height="34" rx="4" fill="url(#gmwhkHandle)" />
        <path d="M24 24 h4 M24 30 h4 M24 36 h4 M24 42 h4" stroke="#451a03" strokeOpacity="0.35" strokeWidth="0.8" />
        <rect x="22" y="22" width="8" height="34" rx="4" fill="#fff" opacity="0.12" />
      </g>
      {/* 3D hammer head */}
      <g transform="rotate(40 26 18)">
        <rect x="7" y="5" width="38" height="22" rx="6" fill="url(#gmwhkHead)" />
        {/* top highlight bevel */}
        <rect x="8" y="6" width="36" height="6" rx="3" fill="#fff" opacity="0.45" />
        {/* bottom shadow bevel */}
        <rect x="8" y="21" width="36" height="5" rx="2.5" fill="#000" opacity="0.2" />
        {/* strike ring */}
        <circle cx="10" cy="16" r="2.4" fill="#fff" opacity="0.7" />
        {/* impact sparks */}
        <path d="M3 14 l-3 -2 M3 18 l-3 2 M2 16 h-3" stroke="#fde68a" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Launcher({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <radialGradient id="gmlnchBall" cx="38%" cy="32%" r="75%" fx="32%" fy="24%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f5a623" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>
        <linearGradient id="gmlnchCannon" x1="0" y1="30" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2e1065" />
        </linearGradient>
        <linearGradient id="gmlnchBarrel" x1="0" y1="30" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="60%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <radialGradient id="gmlnchMuzzle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      {/* 3D cannon base */}
      <g transform="rotate(-38 30 40)">
        <rect x="6" y="29" width="48" height="20" rx="10" fill="url(#gmlnchCannon)" />
        <rect x="6" y="29" width="48" height="6" rx="3" fill="#fff" opacity="0.45" />
        <rect x="6" y="43" width="48" height="6" rx="3" fill="#000" opacity="0.25" />
        {/* barrel rim / muzzle */}
        <rect x="48" y="26" width="8" height="26" rx="4" fill="url(#gmlnchBarrel)" />
        <ellipse cx="52" cy="39" rx="3" ry="11" fill="url(#gmlnchMuzzle)" />
        {/* bolt detail */}
        <circle cx="14" cy="39" r="3" fill="#fff" opacity="0.6" />
        <circle cx="14" cy="39" r="1.4" fill="#3b2a8c" opacity="0.5" />
      </g>
      {/* glowing 3D projectile */}
      <circle cx="48" cy="18" r="11" fill="url(#gmlnchBall)" />
      <circle cx="44" cy="14" r="3.2" fill="#fff" opacity="0.8" />
      {/* launch streak */}
      <path d="M58 8 q4 1 4 5" stroke="#fde68a" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M61 6 l2 2 M61 13 l2 -1" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Riddle({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gmrddl" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b2a8c" /><stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="27" fill="url(#gmrddl)" />
      <circle cx="32" cy="32" r="27" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" />
      <text x="32" y="45" textAnchor="middle" fontSize="36" fontWeight="800" fill="#fff" fontFamily="sans-serif">?</text>
    </svg>
  );
}

function MathPuzzle({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gmmpzl" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#3b2a8c" />
        </linearGradient>
      </defs>
      <path d="M16 10 h32 v12 a5 5 0 1 0 0 8 v12 h-12 a5 5 0 1 1 -8 0 h-12 v-12 a5 5 0 1 1 0 -8 z" fill="url(#gmmpzl)" />
      <path d="M16 10 h32 v4 h-32 z" fill="#fff" opacity="0.2" />
      <text x="32" y="40" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff" fontFamily="sans-serif">×+</text>
    </svg>
  );
}

function WordScramble({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gmws1" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#3b2a8c" />
        </linearGradient>
        <linearGradient id="gmws2" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <g transform="rotate(-12 16 34)">
        <rect x="6" y="22" width="20" height="24" rx="4" fill="url(#gmws1)" />
        <text x="16" y="40" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="sans-serif">A</text>
      </g>
      <g transform="rotate(8 34 26)">
        <rect x="24" y="16" width="20" height="24" rx="4" fill="url(#gmws2)" />
        <text x="34" y="34" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="sans-serif">B</text>
      </g>
      <g transform="rotate(-6 50 38)">
        <rect x="40" y="26" width="20" height="24" rx="4" fill="url(#gmws1)" />
        <text x="50" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="sans-serif">C</text>
      </g>
    </svg>
  );
}

function SaveKing({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gmskCape" x1="0" y1="20" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <radialGradient id="gmskFace" cx="40%" cy="35%" r="70%" fx="35%" fy="28%">
          <stop offset="0%" stopColor="#fff7e6" /><stop offset="60%" stopColor="#fcd9a8" /><stop offset="100%" stopColor="#c98a4a" />
        </radialGradient>
        <linearGradient id="gmskCrown" x1="0" y1="6" x2="0" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="gmskTunic" x1="0" y1="26" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {/* cape */}
      <path d="M20 38 C14 50 14 58 16 62 L48 62 C50 58 50 50 44 38 Z" fill="url(#gmskCape)" />
      {/* tunic */}
      <path d="M22 28 h20 v18 a10 10 0 0 1 -20 0 Z" fill="url(#gmskTunic)" />
      <path d="M22 28 h20 v5 h-20 Z" fill="#fbbf24" opacity="0.9" />
      {/* head */}
      <circle cx="32" cy="24" r="9" fill="url(#gmskFace)" />
      {/* anime eyes */}
      <ellipse cx="28.5" cy="25" rx="1.8" ry="2.6" fill="#1e293b" />
      <ellipse cx="35.5" cy="25" rx="1.8" ry="2.6" fill="#1e293b" />
      <circle cx="29" cy="24" r="0.7" fill="#fff" />
      <circle cx="36" cy="24" r="0.7" fill="#fff" />
      {/* worried brows */}
      <path d="M26.5 21 l3 -0.8 M37.5 21 l-3 -0.8" stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round" />
      {/* crown */}
      <path d="M22 13 l4 -6 6 4 6 -4 4 6 v3 h-20 z" fill="url(#gmskCrown)" />
      <circle cx="32" cy="13" r="1.8" fill="#dc2626" />
      <circle cx="24" cy="14" r="1.2" fill="#dc2626" />
      <circle cx="40" cy="14" r="1.2" fill="#dc2626" />
    </svg>
  );
}

function RoyalMatch({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <radialGradient id="gmrmGem" cx="40%" cy="32%" r="75%" fx="34%" fy="26%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </radialGradient>
        <linearGradient id="gmrmChest" x1="0" y1="22" x2="0" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#b45309" /><stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="gmrmWater" x1="0" y1="40" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>
      {/* rising water */}
      <path d="M2 46 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 V62 H2 Z" fill="url(#gmrmWater)" />
      {/* chest body */}
      <rect x="16" y="30" width="32" height="22" rx="3" fill="url(#gmrmChest)" />
      <rect x="16" y="34" width="32" height="3" fill="#fcd34d" />
      <rect x="16" y="44" width="32" height="3" fill="#fcd34d" />
      {/* lid */}
      <path d="M16 30 q16 -16 32 0 Z" fill="#8b5a2b" />
      <path d="M16 30 q16 -13 32 0 Z" fill="#fcd34d" />
      <path d="M18 29.5 q14 -10 28 0 Z" fill="#b45309" />
      {/* lock */}
      <rect x="29" y="32" width="6" height="7" rx="1" fill="#fcd34d" />
      {/* gem on top */}
      <path d="M32 6 l8 9 l-8 11 l-8 -11 Z" fill="url(#gmrmGem)" />
      <path d="M32 6 l8 9 l-8 3 Z" fill="#fff" opacity="0.35" />
      {/* sparkles */}
      <circle cx="22" cy="20" r="1.3" fill="#fde68a" />
      <circle cx="44" cy="24" r="1.3" fill="#fde68a" />
    </svg>
  );
}

const MAP = {
  "snake-game": Snake,
  "game-2048": Game2048,
  "memory-match": MemoryMatch,
  "whack-a-mole": Whack,
  "ball-launcher": Launcher,
  "riddle-game": Riddle,
  "math-puzzle": MathPuzzle,
  "word-scramble": WordScramble,
  "save-the-king": SaveKing,
  "royal-match": RoyalMatch,
};

export default function GameIcon({ slug, className = "w-16 h-16" }) {
  const Cmp = MAP[slug];
  if (!Cmp) return null;
  return <Cmp className={className} style={SHADOW} />;
}