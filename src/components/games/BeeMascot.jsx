// شخصية النحلة (FluentBee) المشتركة لكل ألعاب التعلّم
export default function BeeMascot({ mood = "idle", size = 72 }) {
  const happy = mood === "happy";
  const sad = mood === "sad";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0 drop-shadow-[0_6px_12px_hsl(var(--primary)/0.35)]">
      <defs>
        <radialGradient id="bmg" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="60%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      {/* أجنحة */}
      <ellipse cx="36" cy="34" rx="13" ry="9" fill="#ffffff" opacity="0.55" transform="rotate(-22 36 34)" />
      <ellipse cx="64" cy="34" rx="13" ry="9" fill="#ffffff" opacity="0.55" transform="rotate(22 64 34)" />
      {/* قرون الاستشعار */}
      <path d="M42 22 q-5 -10 -9 -12" stroke="#312e81" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M58 22 q5 -10 9 -12" stroke="#312e81" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="9" r="2.4" fill="#312e81" /><circle cx="67" cy="9" r="2.4" fill="#312e81" />
      {/* الجسم */}
      <ellipse cx="50" cy="60" rx="28" ry="26" fill="url(#bmg)" />
      <path d="M22 56 q28 10 56 0" stroke="#312e81" strokeWidth="3" fill="none" opacity="0.85" />
      <path d="M24 66 q26 8 52 0" stroke="#312e81" strokeWidth="3" fill="none" opacity="0.85" />
      {/* العيون */}
      {happy ? (
        <>
          <path d="M40 55 q4 -6 8 0" stroke="#1e1b4b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M52 55 q4 -6 8 0" stroke="#1e1b4b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </>
      ) : sad ? (
        <>
          <circle cx="44" cy="56" r="3.4" fill="#1e1b4b" /><circle cx="60" cy="56" r="3.4" fill="#1e1b4b" />
        </>
      ) : (
        <>
          <circle cx="44" cy="56" r="4.2" fill="#fff" /><circle cx="60" cy="56" r="4.2" fill="#fff" />
          <circle cx="45" cy="57" r="2" fill="#1e1b4b" /><circle cx="61" cy="57" r="2" fill="#1e1b4b" />
        </>
      )}
      {/* الفم */}
      {happy ? (
        <path d="M44 68 q6 7 12 0" stroke="#1e1b4b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : sad ? (
        <path d="M44 72 q6 -7 12 0" stroke="#1e1b4b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M45 68 q5 4 10 0" stroke="#1e1b4b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}