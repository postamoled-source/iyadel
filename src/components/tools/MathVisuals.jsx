import { useI18n } from "@/lib/i18n";
import { mathEngine } from "@/lib/math-engine";

// أداة مساعدة لتحويل القيمة إلى رقم آمن
const num = (v) => {
  const x = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(x) ? x : null;
};

// ---------- زر الآلة الحاسبة ----------
function Key({ children, onClick, variant = "num", wide }) {
  const base =
    "h-11 rounded-xl text-sm font-bold transition-all active:scale-90 select-none flex items-center justify-center";
  const variants = {
    num: "bg-white dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] border border-[#FFE8A0] dark:border-[#4B3F8A] hover:border-[#F59E0B]",
    op: "bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white shadow-sm",
    eq: "bg-gradient-to-br from-[#F59E0B] to-[#CA8A04] text-white shadow-sm",
    fn: "bg-[#EEF2FF] dark:bg-[#312E5F] text-[#4F46E5] dark:text-[#A5B4FC] border border-[#C7D2FE] dark:border-[#4B3F8A] text-xs",
    clear: "bg-[#FEF2F2] dark:bg-[#3F1D1D] text-[#DC2626] border border-[#FECACA] dark:border-[#7F1D1D] text-xs",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${variants[variant]} ${wide ? "col-span-2" : ""}`}
    >
      {children}
    </button>
  );
}

function KeypadShell({ expr, children }) {
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-3 transition-colors duration-300">
      <div className="rounded-xl bg-[#1E1B4B] dark:bg-black/40 px-4 h-14 flex items-center justify-end overflow-x-auto">
        <span className="text-right text-2xl font-bold text-[#FEF3C7] tabular-nums whitespace-nowrap">
          {expr || "0"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3">{children}</div>
    </div>
  );
}

// ---------- 1. آلة حاسبة أساسية ----------
export function BasicKeypad({ expr, onKey, onClear, onEquals }) {
  return (
    <KeypadShell expr={expr}>
      <Key variant="clear" onClick={onClear}>C</Key>
      <Key variant="fn" onClick={() => onKey("(")}>(</Key>
      <Key variant="fn" onClick={() => onKey(")")}>)</Key>
      <Key variant="op" onClick={() => onKey("÷")}>÷</Key>
      <Key onClick={() => onKey("7")}>7</Key>
      <Key onClick={() => onKey("8")}>8</Key>
      <Key onClick={() => onKey("9")}>9</Key>
      <Key variant="op" onClick={() => onKey("×")}>×</Key>
      <Key onClick={() => onKey("4")}>4</Key>
      <Key onClick={() => onKey("5")}>5</Key>
      <Key onClick={() => onKey("6")}>6</Key>
      <Key variant="op" onClick={() => onKey("−")}>−</Key>
      <Key onClick={() => onKey("1")}>1</Key>
      <Key onClick={() => onKey("2")}>2</Key>
      <Key onClick={() => onKey("3")}>3</Key>
      <Key variant="op" onClick={() => onKey("+")}>+</Key>
      <Key wide onClick={() => onKey("0")}>0</Key>
      <Key onClick={() => onKey(".")}>.</Key>
      <Key variant="eq" onClick={onEquals}>=</Key>
    </KeypadShell>
  );
}

// ---------- 2. آلة حاسبة علمية ----------
export function ScientificKeypad({ expr, onKey, onClear, onEquals }) {
  const sci = [
    "sin(", "cos(", "tan(", "π", "e",
    "^", "sqrt(", "(", ")", "÷",
    "log(", "ln(", ".", "C", "×",
  ];
  return (
    <KeypadShell expr={expr}>
      {sci.map((k, i) => {
        if (k === "C") return <Key key={i} variant="clear" onClick={onClear}>C</Key>;
        if (["÷", "×", "^"].includes(k)) return <Key key={i} variant="op" onClick={() => onKey(k)}>{k}</Key>;
        return <Key key={i} variant="fn" onClick={() => onKey(k)}>{k}</Key>;
      })}
      <Key onClick={() => onKey("7")}>7</Key>
      <Key onClick={() => onKey("8")}>8</Key>
      <Key onClick={() => onKey("9")}>9</Key>
      <Key variant="op" onClick={() => onKey("−")}>−</Key>
      <Key onClick={() => onKey("4")}>4</Key>
      <Key onClick={() => onKey("5")}>5</Key>
      <Key onClick={() => onKey("6")}>6</Key>
      <Key variant="op" onClick={() => onKey("+")}>+</Key>
      <Key wide onClick={() => onKey("0")}>0</Key>
      <Key variant="eq" onClick={onEquals}>=</Key>
    </KeypadShell>
  );
}

// ---------- 3. آلة الكسور البصرية ----------
function FractionBox({ n, d }) {
  const valid = n !== null && d !== null && d !== 0;
  return (
    <div className="flex flex-col items-center min-w-[56px]">
      <span className="text-xl font-extrabold text-[#1E1B4B] dark:text-[#FEF3C7] tabular-nums">{n ?? "?"}</span>
      <span className="w-full h-[3px] my-1 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#F59E0B]" />
      <span className="text-xl font-extrabold text-[#1E1B4B] dark:text-[#FEF3C7] tabular-nums">{d ?? "?"}</span>
    </div>
  );
}
export function FractionVisual({ a, b, c, d, op }) {
  const { t } = useI18n();
  const sym = { add: "+", sub: "−", mul: "×", div: "÷" }[op] || "+";
  const na = num(a), nb = num(b), nc = num(c), nd = num(d);
  const ready = na !== null && nb !== null && nc !== null && nd !== null && nb !== 0 && nd !== 0;
  let preview = null;
  if (ready) {
    try {
      const r = mathEngine("fraction", { a: na, b: nb, c: nc, d: nd, op });
      preview = r.display;
    } catch { preview = null; }
  }
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-5 flex items-center justify-center gap-4 transition-colors duration-300">
      <FractionBox n={na} d={nb} />
      <span className="text-2xl font-bold text-[#6D28D9]">{sym}</span>
      <FractionBox n={nc} d={nd} />
      <span className="text-2xl font-bold text-muted-foreground">=</span>
      <div className="flex flex-col items-center min-w-[56px]">
        <span className="text-lg font-extrabold text-[#F59E0B] tabular-nums leading-tight">{preview ?? "…"}</span>
        <span className="text-[10px] text-muted-foreground mt-1">{t("Simplified")}</span>
      </div>
    </div>
  );
}

// ---------- 4. آلة الإحصاء البصرية (مخطط أعمدة) ----------
export function StatsVisual({ numbers }) {
  const { t } = useI18n();
  const nums = String(numbers || "")
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((x) => Number.isFinite(x));
  if (nums.length === 0) {
    return (
      <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-6 text-center text-sm text-muted-foreground transition-colors duration-300">
        {t("Enter numbers to see a live bar chart")}
      </div>
    );
  }
  const max = Math.max(...nums, 0);
  const min = Math.min(...nums, 0);
  const range = max - min || 1;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const meanPct = ((mean - min) / range) * 100;
  const W = 280, H = 130, pad = 8;
  const bw = (W - pad * 2) / nums.length;
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 transition-colors duration-300">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {nums.map((v, i) => {
          const h = ((v - min) / range) * (H - pad * 2) || 2;
          const x = pad + i * bw + 2;
          const y = H - pad - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw - 4} height={h} rx={3}
                fill="url(#barGrad)" />
              <text x={x + (bw - 4) / 2} y={H - pad + 2} textAnchor="middle"
                className="fill-[#6B7280] dark:fill-[#A8A6C4]" style={{ fontSize: 9 }}>{v}</text>
            </g>
          );
        })}
        <line x1={pad} y1={H - pad - (meanPct / 100) * (H - pad * 2)} x2={W - pad}
          y2={H - pad - (meanPct / 100) * (H - pad * 2)} stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={W - pad} y={H - pad - (meanPct / 100) * (H - pad * 2) - 4} textAnchor="end"
          className="fill-[#DC2626]" style={{ fontSize: 9, fontWeight: 700 }}>μ={mean.toFixed(2)}</text>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ---------- 5. آلة الهندسة البصرية ----------
export function GeometryVisual({ type, a, b, c }) {
  const { t } = useI18n();
  const x = num(a), y = num(b), z = num(c);
  const W = 200, H = 150, cx = 100, cy = 95;
  const scale = 30;
  const render = () => {
    if (type === "circle") {
      const r = Math.max(8, Math.min((x || 0) * scale, 60));
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="rgba(109,40,217,0.15)" stroke="#6D28D9" strokeWidth={2} />
          <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 2" />
          <text x={cx + r / 2} y={cy - 6} textAnchor="middle" className="fill-[#F59E0B]" style={{ fontSize: 11, fontWeight: 700 }}>r={x ?? "?"}</text>
        </g>
      );
    }
    if (type === "tri") {
      const bw = Math.max(8, Math.min((x || 0) * scale, 120));
      const bh = Math.max(8, Math.min((y || 0) * scale, 90));
      const bx = cx - bw / 2;
      return (
        <g>
          <polygon points={`${bx},${cy} ${bx + bw},${cy} ${bx + bw / 2},${cy - bh}`}
            fill="rgba(109,40,217,0.15)" stroke="#6D28D9" strokeWidth={2} />
          <text x={bx + bw / 2} y={cy + 14} textAnchor="middle" className="fill-[#F59E0B]" style={{ fontSize: 10, fontWeight: 700 }}>b={x ?? "?"}</text>
          <text x={bx + bw / 2 + 10} y={cy - bh / 2} textAnchor="middle" className="fill-[#F59E0B]" style={{ fontSize: 10, fontWeight: 700 }}>h={y ?? "?"}</text>
        </g>
      );
    }
    if (type === "cube") {
      const w = Math.max(10, Math.min((x || 0) * scale, 70));
      const h = Math.max(10, Math.min((y || 0) * scale, 60));
      const dep = Math.max(8, Math.min((z || 0) * scale, 40));
      const ox = 20, oy = -15;
      return (
        <g>
          <polygon points={`${cx - w / 2},${cy - h / 2} ${cx + w / 2},${cy - h / 2} ${cx + w / 2 + ox},${cy - h / 2 + oy} ${cx - w / 2 + ox},${cy - h / 2 + oy}`}
            fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth={1.5} />
          <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="rgba(109,40,217,0.15)" stroke="#6D28D9" strokeWidth={2} />
          <line x1={cx + w / 2} y1={cy - h / 2} x2={cx + w / 2 + ox} y2={cy - h / 2 + oy} stroke="#6D28D9" strokeWidth={1.5} />
          <line x1={cx + w / 2} y1={cy + h / 2} x2={cx + w / 2 + ox} y2={cy + h / 2 + oy} stroke="#6D28D9" strokeWidth={1.5} />
          <line x1={cx - w / 2} y1={cy + h / 2} x2={cx - w / 2 + ox} y2={cy + h / 2 + oy} stroke="#6D28D9" strokeWidth={1.5} />
        </g>
      );
    }
    // rect
    const w = Math.max(10, Math.min((x || 0) * scale, 130));
    const h = Math.max(10, Math.min((y || 0) * scale, 90));
    return (
      <g>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="rgba(109,40,217,0.15)" stroke="#6D28D9" strokeWidth={2} />
        <text x={cx} y={cy - h / 2 - 6} textAnchor="middle" className="fill-[#F59E0B]" style={{ fontSize: 10, fontWeight: 700 }}>w={x ?? "?"}</text>
        <text x={cx + w / 2 + 8} y={cy + 3} textAnchor="start" className="fill-[#F59E0B]" style={{ fontSize: 10, fontWeight: 700 }}>h={y ?? "?"}</text>
      </g>
    );
  };
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 flex items-center justify-center transition-colors duration-300">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px] h-auto">
        {render()}
      </svg>
    </div>
  );
}

// ---------- 6. آلة المعادلة التربيعية (قطع مكافئ) ----------
export function ParabolaVisual({ a, b, c }) {
  const { t } = useI18n();
  const A = num(a), B = num(b), C = num(c);
  const W = 240, H = 160;
  const ox = W / 2, oy = H / 2;
  const sx = 16, sy = 16; // pixels per unit
  let pts = [];
  let roots = [];
  if (A !== null && A !== 0 && B !== null && C !== null) {
    const disc = B * B - 4 * A * C;
    if (disc >= 0) {
      const r1 = (-B + Math.sqrt(disc)) / (2 * A);
      const r2 = (-B - Math.sqrt(disc)) / (2 * A);
      roots = [r1, r2];
    }
    for (let px = 0; px <= W; px += 2) {
      const xv = (px - ox) / sx;
      const yv = A * xv * xv + B * xv + C;
      const py = oy - yv * sy;
      if (py > -20 && py < H + 20) pts.push(`${px},${py}`);
    }
  }
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 transition-colors duration-300">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#94A3B8" strokeWidth={1} />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#94A3B8" strokeWidth={1} />
        {pts.length > 1 && (
          <polyline points={pts.join(" ")} fill="none" stroke="#6D28D9" strokeWidth={2.5} />
        )}
        {roots.map((r, i) => (
          <g key={i}>
            <circle cx={ox + r * sx} cy={oy} r={4} fill="#F59E0B" />
            <text x={ox + r * sx} y={oy + 16} textAnchor="middle" className="fill-[#F59E0B]" style={{ fontSize: 9, fontWeight: 700 }}>{r.toFixed(2)}</text>
          </g>
        ))}
      </svg>
      {roots.length === 0 && A !== null && A !== 0 && (
        <p className="text-center text-xs text-muted-foreground mt-1">{t("No real roots (parabola does not cross x-axis)")}</p>
      )}
    </div>
  );
}

// ---------- 7. آلة القاسم المشترك البصرية ----------
export function DivisorVisual({ numbers }) {
  const { t } = useI18n();
  const nums = String(numbers || "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((x) => Number.isInteger(x) && x > 0);
  if (nums.length < 2) {
    return (
      <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-6 text-center text-sm text-muted-foreground transition-colors duration-300">
        {t("Enter two or more positive integers")}
      </div>
    );
  }
  const divsOf = (n) => {
    const out = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
    return out;
  };
  const sets = nums.map(divsOf);
  const common = sets.reduce((acc, s) => acc.filter((x) => s.includes(x)));
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 transition-colors duration-300">
      <div className="space-y-3">
        {nums.map((n, i) => (
          <div key={i}>
            <div className="text-xs font-bold text-[#6D28D9] dark:text-[#A5B4FC] mb-1">{n}</div>
            <div className="flex flex-wrap gap-1.5">
              {sets[i].map((d) => {
                const isCommon = common.includes(d);
                const isGcd = d === common[common.length - 1];
                return (
                  <span key={d} className={`px-2 py-0.5 rounded-lg text-xs font-bold tabular-nums ${
                    isGcd ? "bg-[#F59E0B] text-white" :
                    isCommon ? "bg-[#6D28D9]/15 text-[#6D28D9] dark:text-[#C4B5FD] border border-[#6D28D9]/30" :
                    "bg-white dark:bg-[#2D2A5A] text-muted-foreground border border-border"
                  }`}>{d}</span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {common.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          {t("Common divisors")} → <strong className="text-[#F59E0B]">{common.join(", ")}</strong>
        </p>
      )}
    </div>
  );
}

// ---------- 8. آلة التباديل والتوافيق البصرية ----------
export function PermCombVisual({ n, r }) {
  const { t } = useI18n();
  const N = num(n), R = num(r);
  const W = 280, H = 70;
  if (N === null || R === null || N < 0 || R < 0 || R > N) {
    return (
      <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-6 text-center text-sm text-muted-foreground transition-colors duration-300">
        {t("Enter n and r (n ≥ r ≥ 0)")}
      </div>
    );
  }
  const total = Math.min(N, 16);
  const rsize = Math.min(R, 16);
  const gap = 4;
  const dot = (W - gap * (total - 1)) / total;
  return (
    <div className="mt-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 transition-colors duration-300">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {Array.from({ length: total }).map((_, i) => {
          const x = i * (dot + gap);
          const selected = i < rsize;
          return (
            <g key={i}>
              <circle cx={x + dot / 2} cy={H / 2} r={dot / 2 - 1}
                fill={selected ? "#F59E0B" : "rgba(109,40,217,0.15)"}
                stroke={selected ? "#CA8A04" : "#6D28D9"} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <span className="text-[#6D28D9] font-bold">n = {N}</span>
        <span className="text-[#F59E0B] font-bold">r = {R} {t("selected")}</span>
      </div>
      {N > 16 && <p className="text-center text-[10px] text-muted-foreground mt-1">{t("Showing first 16 items")}</p>}
    </div>
  );
}