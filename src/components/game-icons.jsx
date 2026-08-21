// 3D-style game emblems — free-floating, no boxes. One distinct gradient per game.
const SHADOW = { filter: "drop-shadow(0 6px 9px hsl(var(--primary) / 0.35))" };

function Snake({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none">
      <defs>
        <linearGradient id="gmsnk" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path d="M16 52 C16 40 30 42 30 30 C30 18 44 18 44 30" stroke="url(#gmsnk)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="44" cy="22" r="10" fill="url(#gmsnk)" />
      <circle cx="47" cy="19" r="2.4" fill="#fff" />
      <path d="M50 22 q5 1 6 -3" stroke="#f5a623" strokeWidth="2.4" strokeLinecap="round" />
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
        <linearGradient id="gmwhk" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" /><stop offset="100%" stopColor="#be123c" />
        </linearGradient>
      </defs>
      <g transform="rotate(40 26 18)">
        <rect x="8" y="6" width="36" height="20" rx="5" fill="url(#gmwhk)" />
        <rect x="8" y="6" width="36" height="6" rx="3" fill="#fff" opacity="0.25" />
        <rect x="22" y="22" width="8" height="34" rx="4" fill="#92400e" />
      </g>
    </svg>
  );
}

function Launcher({ className, style }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <defs>
        <linearGradient id="gmlnch" x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#3b2a8c" />
        </linearGradient>
      </defs>
      <g transform="rotate(-38 30 38)">
        <rect x="8" y="30" width="44" height="18" rx="9" fill="url(#gmlnch)" />
        <rect x="8" y="30" width="44" height="6" rx="3" fill="#fff" opacity="0.25" />
        <circle cx="14" cy="39" r="3" fill="#fff" opacity="0.6" />
      </g>
      <circle cx="48" cy="18" r="10" fill="#f5a623" />
      <circle cx="45" cy="15" r="3" fill="#fff" opacity="0.7" />
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

const MAP = {
  "snake-game": Snake,
  "game-2048": Game2048,
  "memory-match": MemoryMatch,
  "whack-a-mole": Whack,
  "ball-launcher": Launcher,
  "riddle-game": Riddle,
  "math-puzzle": MathPuzzle,
  "word-scramble": WordScramble,
};

export default function GameIcon({ slug, className = "w-16 h-16" }) {
  const Cmp = MAP[slug];
  if (!Cmp) return null;
  return <Cmp className={className} style={SHADOW} />;
}