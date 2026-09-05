import { useI18n } from "@/lib/i18n";
import {
  calculateBmi, calculateCalories, calculateIdealWeight, calculateBodyFat,
  calculateProtein, calculateCarbs, calculateFat, calculatePace, calculateBmr, calculateTdee,
} from "@/lib/health-engine";

const PRIMARY = "#6D28D9";
const ACCENT = "#F59E0B";

function Card({ children }) {
  return (
    <div className="mt-5 rounded-2xl bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-5">
      {children}
    </div>
  );
}

// Reusable horizontal zone gauge with a moving marker.
function ZoneGauge({ zones, pos, label, value }) {
  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden shadow-inner">
        {zones.map((z, i) => (
          <div key={i} className="flex-1" style={{ background: z.color }} title={z.label} />
        ))}
      </div>
      <div className="relative mt-1 h-4">
        <div
          className="absolute -top-4 w-4 h-4 rounded-full bg-white dark:bg-[#FEF3C7] border-2 border-[#1E1B4B] dark:border-[#FEF3C7] shadow"
          style={{ left: `calc(${pos}% - 8px)` }}
        />
      </div>
      <div className="flex text-[9px] sm:text-[10px] text-muted-foreground mt-1">
        {zones.map((z, i) => (
          <span key={i} className="flex-1 text-center leading-tight">{z.label}</span>
        ))}
      </div>
      {value != null && (
        <div className="mt-2 text-center text-sm font-bold text-[#1E1B4B] dark:text-[#FEF3C7]">
          {value} {label && <span className="text-muted-foreground font-normal">{label}</span>}
        </div>
      )}
    </div>
  );
}

// Reusable donut for macro proportions.
function Donut({ percent, color, label, value, unit }) {
  const { t } = useI18n();
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, percent)) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 140 140" className="w-32 h-32">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#FDE68A" strokeWidth="14" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="800" fill={PRIMARY}>{value ?? "—"}</text>
        {unit && <text x="70" y="92" textAnchor="middle" fontSize="11" fill="#92400E">{unit}</text>}
      </svg>
      {label && <span className="text-xs font-semibold text-muted-foreground">{t(label)} · {Math.round(percent)}%</span>}
    </div>
  );
}

export function BmiVisual({ weight, height }) {
  const { t } = useI18n();
  const r = calculateBmi({ weight, height });
  const zones = [
    { label: t("Underweight"), color: "#60a5fa" },
    { label: t("Normal"), color: "#34d399" },
    { label: t("Overweight"), color: "#fbbf24" },
    { label: t("Obese"), color: "#f87171" },
  ];
  if (!r) return null;
  return (
    <Card>
      <ZoneGauge zones={zones} pos={r.pos} value={r.bmi} label={t("BMI")} />
    </Card>
  );
}

export function IdealWeightVisual({ gender, height, weight }) {
  const { t } = useI18n();
  const r = calculateIdealWeight({ gender, height });
  if (!r) return null;
  const minKg = Math.max(40, Math.floor(r.low - 5));
  const maxKg = Math.ceil(r.high + 5);
  const span = maxKg - minKg;
  const lowPos = ((r.low - minKg) / span) * 100;
  const highPos = ((r.high - minKg) / span) * 100;
  const idealPos = ((r.ideal - minKg) / span) * 100;
  const curPos = weight ? Math.max(0, Math.min(100, ((parseFloat(weight) - minKg) / span) * 100)) : null;
  return (
    <Card>
      <div className="relative h-40 mx-auto" style={{ maxWidth: 260 }}>
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 rounded-full bg-[#FDE68A] dark:bg-[#4B3F8A]" />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 rounded-full bg-emerald-300/70"
          style={{ bottom: `${lowPos}%`, height: `${highPos - lowPos}%` }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#6D28D9] border-2 border-white shadow flex items-center justify-center"
          style={{ bottom: `calc(${idealPos}% - 10px)` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        {curPos != null && (
          <div
            className="absolute left-1/2 translate-x-3 w-4 h-4 rounded-full bg-[#F59E0B] border-2 border-white shadow"
            style={{ bottom: `calc(${curPos}% - 8px)` }}
          />
        )}
        <div className="absolute left-0 top-0 text-[10px] text-muted-foreground">{maxKg} kg</div>
        <div className="absolute left-0 bottom-0 text-[10px] text-muted-foreground">{minKg} kg</div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-600">{t("Range")}</div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#6D28D9]" />{t("Ideal")}: <strong>{r.ideal}</strong> kg</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#F59E0B]" />{t("Your weight")}</span>
      </div>
    </Card>
  );
}

export function BodyFatVisual({ gender, age, weight, height, waist, neck, hip }) {
  const { t } = useI18n();
  const r = calculateBodyFat({ gender, age, weight, height, waist, neck, hip });
  if (!r || r.error) return null;
  const zones = [
    { label: t("Essential"), color: "#60a5fa" },
    { label: t("Athletic"), color: "#34d399" },
    { label: t("Fitness"), color: "#a3e635" },
    { label: t("Acceptable"), color: "#fbbf24" },
    { label: t("Obese"), color: "#f87171" },
  ];
  return (
    <Card>
      <ZoneGauge zones={zones} pos={r.pos} value={r.bodyFat} label="%" />
    </Card>
  );
}

export function ProteinVisual({ weight, activity, goal }) {
  const { t } = useI18n();
  const r = calculateProtein({ weight, activity, goal });
  if (!r) return null;
  const w = parseFloat(weight) || 0;
  const maxG = Math.max(r.high, w * 2.5, 1);
  const pct = (r.protein / maxG) * 100;
  return (
    <Card>
      <div className="flex items-center gap-4">
        <Donut percent={pct} color={ACCENT} label={t("Protein")} value={r.protein} unit="g" />
        <div className="flex-1 text-xs text-[#1E1B4B] dark:text-[#FEF3C7] space-y-2">
          <div className="flex justify-between"><span>{t("Body weight")}</span><strong>{w} kg</strong></div>
          <div className="flex justify-between"><span>{t("Factor")}</span><strong>{r.factor} g/kg</strong></div>
          <div className="flex justify-between"><span>{t("Range")}</span><strong>{r.low}–{r.high} g</strong></div>
        </div>
      </div>
    </Card>
  );
}

export function CarbsVisual({ calories, percent }) {
  const { t } = useI18n();
  const r = calculateCarbs({ calories, percent });
  if (!r) return null;
  const p = r.percent;
  return (
    <Card>
      <div className="flex items-center gap-4">
        <Donut percent={p} color={PRIMARY} label={t("Carbs")} value={r.grams} unit="g" />
        <div className="flex-1 text-xs text-[#1E1B4B] dark:text-[#FEF3C7] space-y-2">
          <div className="flex justify-between"><span>{t("Calories")}</span><strong>{calories}</strong></div>
          <div className="flex justify-between"><span>{t("Carb %")}</span><strong>{p}%</strong></div>
          <div className="flex justify-between"><span>{t("Calories from carbs")}</span><strong>{Math.round((parseFloat(calories) * p) / 100)}</strong></div>
        </div>
      </div>
    </Card>
  );
}

export function FatVisual({ calories, percent }) {
  const { t } = useI18n();
  const r = calculateFat({ calories, percent });
  if (!r) return null;
  const p = r.percent;
  return (
    <Card>
      <div className="flex items-center gap-4">
        <Donut percent={p} color={ACCENT} label={t("Fat")} value={r.grams} unit="g" />
        <div className="flex-1 text-xs text-[#1E1B4B] dark:text-[#FEF3C7] space-y-2">
          <div className="flex justify-between"><span>{t("Calories")}</span><strong>{calories}</strong></div>
          <div className="flex justify-between"><span>{t("Fat %")}</span><strong>{p}%</strong></div>
          <div className="flex justify-between"><span>{t("Calories from fat")}</span><strong>{Math.round((parseFloat(calories) * p) / 100)}</strong></div>
        </div>
      </div>
    </Card>
  );
}

export function PaceVisual({ distance, time }) {
  const { t } = useI18n();
  const r = calculatePace({ distance, time });
  if (!r) return null;
  const maxSpeed = 30;
  const ang = 180 * (1 - Math.min(r.speed, maxSpeed) / maxSpeed);
  const nx = 130 + 95 * Math.cos((ang * Math.PI) / 180);
  const ny = 140 - 95 * Math.sin((ang * Math.PI) / 180);
  const arcLen = Math.PI * 110;
  const activeLen = (Math.min(r.speed, maxSpeed) / maxSpeed) * arcLen;
  return (
    <Card>
      <div className="relative w-full" style={{ maxWidth: 280, margin: "0 auto" }}>
        <svg viewBox="0 0 260 150" className="w-full h-[120px]">
          <defs>
            <linearGradient id="paceGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
          <path d="M20 140 A110 110 0 0 1 240 140" fill="none" stroke="#FDE68A" strokeWidth="14" strokeLinecap="round" />
          <path d="M20 140 A110 110 0 0 1 240 140" fill="none" stroke="url(#paceGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${activeLen} ${arcLen}`} style={{ transition: "stroke-dasharray 0.5s ease" }} />
          <line x1="130" y1="140" x2={nx} y2={ny} stroke={PRIMARY} strokeWidth="4" strokeLinecap="round" style={{ transition: "all 0.5s ease" }} />
          <circle cx="130" cy="140" r="11" fill={PRIMARY} />
          <circle cx="130" cy="140" r="4" fill="#FFFBEB" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <div className="text-3xl font-black text-[#1E1B4B] dark:text-[#FEF3C7] tabular-nums leading-none">{r.speed}</div>
          <div className="text-[10px] font-semibold text-muted-foreground">km/h</div>
        </div>
      </div>
      <div className="mt-1 flex justify-center gap-6 text-xs">
        <span className="text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Pace")}: <strong className="text-primary">{r.pace}</strong> {t("min/km")}</span>
        <span className="text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Speed")}: <strong className="text-accent">{r.speed}</strong> km/h</span>
      </div>
    </Card>
  );
}

export function BmrVisual({ age, gender, height, weight }) {
  const { t } = useI18n();
  const r = calculateBmr({ age, gender, height, weight });
  if (!r) return null;
  const maxBmr = 3000;
  const pct = Math.min((r.bmr / maxBmr) * 100, 100);
  return (
    <Card>
      <div className="text-center mb-3 text-sm font-semibold text-muted-foreground">{t("Basal Metabolic Rate")}</div>
      <div className="relative h-6 rounded-full bg-[#FDE68A] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-center text-2xl font-black text-[#1E1B4B] dark:text-[#FEF3C7]">{r.bmr} <span className="text-sm font-normal text-muted-foreground">{t("kcal/day")}</span></div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">{t("Energy at complete rest (Mifflin-St Jeor).")}</p>
    </Card>
  );
}

export function TdeeVisual({ age, gender, height, weight, activity }) {
  const { t } = useI18n();
  const r = calculateTdee({ age, gender, height, weight, activity });
  if (!r) return null;
  const factor = r.factor;
  const minF = 1.2, maxF = 1.9;
  const pos = ((factor - minF) / (maxF - minF)) * 100;
  const steps = [
    { label: t("Sedentary"), f: 1.2 },
    { label: t("Light"), f: 1.375 },
    { label: t("Moderate"), f: 1.55 },
    { label: t("Active"), f: 1.725 },
    { label: t("Very Active"), f: 1.9 },
  ];
  return (
    <Card>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-[#60a5fa] via-[#fbbf24] to-[#f87171] overflow-hidden">
        <div className="absolute -top-1.5 w-5 h-5 rounded-full bg-white dark:bg-[#FEF3C7] border-2 border-[#6D28D9] shadow" style={{ left: `calc(${pos}% - 10px)` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-2">
        {steps.map((s) => <span key={s.f} className="flex-1 text-center leading-tight">{s.label}</span>)}
      </div>
      <div className="mt-3 text-center text-2xl font-black text-[#1E1B4B] dark:text-[#FEF3C7]">{r.tdee} <span className="text-sm font-normal text-muted-foreground">{t("kcal/day")}</span></div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">{t("BMR × activity factor")}: {r.bmr} × {factor}</p>
    </Card>
  );
}

export function CalorieVisual({ age, gender, height, weight, activity }) {
  const { t } = useI18n();
  const r = calculateCalories({ age, gender, height, weight, activity });
  if (!r) return null;
  const minV = Math.min(r.loss, r.bmr) * 0.7;
  const maxV = r.gain * 1.1;
  const span = maxV - minV;
  const pct = (v) => ((v - minV) / span) * 100;
  return (
    <Card>
      <div className="relative h-10 rounded-full bg-gradient-to-r from-[#60a5fa] via-[#34d399] to-[#fbbf24] overflow-hidden">
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/70" style={{ left: `${pct(r.loss)}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/70" style={{ left: `${pct(r.maintenance)}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/70" style={{ left: `${pct(r.gain)}%` }} />
        <div className="absolute -top-1 w-5 h-5 rounded-full bg-[#6D28D9] border-2 border-white shadow flex items-center justify-center" style={{ left: `calc(${pct(r.maintenance)}% - 10px)` }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
        <span>{t("Loss")}<br/><strong className="text-[#1E1B4B] dark:text-[#FEF3C7]">{r.loss}</strong></span>
        <span className="text-center">{t("Maintenance")}<br/><strong className="text-primary">{r.maintenance}</strong></span>
        <span className="text-right">{t("Gain")}<br/><strong className="text-[#1E1B4B] dark:text-[#FEF3C7]">{r.gain}</strong></span>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("BMR")} {r.bmr} · {t("TDEE")} {r.tdee} {t("kcal/day")}</p>
    </Card>
  );
}