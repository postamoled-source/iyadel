export default function Logo({ className = "w-14 h-14 md:w-20 md:h-20" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="iyadel"
      style={{ filter: "drop-shadow(0 8px 20px hsl(var(--primary) / 0.35))" }}
    >
      <defs>
        <linearGradient id="iyadelLogoGrad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b2a8c" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      {/* Left petal */}
      <path
        d="M50 6 C44 34, 30 46, 12 52 C30 56, 44 66, 50 94 C56 66, 70 56, 88 52 C70 46, 56 34, 50 6 Z"
        fill="url(#iyadelLogoGrad)"
      />
      {/* Inner highlight spark */}
      <path
        d="M50 26 C47 42, 40 49, 30 52 C40 55, 47 62, 50 78 C53 62, 60 55, 70 52 C60 49, 53 42, 50 26 Z"
        fill="hsl(var(--background))"
        opacity="0.18"
      />
    </svg>
  );
}