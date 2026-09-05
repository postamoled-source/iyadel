import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { NumInput, CalcButton } from "@/components/tools/ToolUI";

const STR = {
  en: {
    tabs: { fuel: "⛽ Fuel Cost", mileage: "📊 Mileage", hp: "🏎️ Power", engine: "🔧 Engine" },
    fuel: {
      title: "Fuel Cost Calculator", badge: "Economy",
      distance: "Distance", distanceUnit: "(km)",
      consumption: "Fuel Consumption", consumptionUnit: "(L/100km)",
      price: "Fuel Price", priceUnit: "(per L)",
      passengers: "Passengers", passengersUnit: "(to split cost)",
      btn: "Calculate Cost",
      fuelUsedLbl: "Fuel used", perPersonLbl: "Per person",
      msgs: ["Economical trip! Low cost", "Reasonable cost — plan your trip well", "High cost — consider sharing the ride", "Very high cost — try alternative transport"],
      enter: "Enter your trip details and press Calculate",
      invalid: "⚠️ Please check all inputs",
    },
    mileage: {
      title: "Gas Mileage Calculator", badge: "Consumption",
      distance: "Distance", distanceUnit: "(km)",
      fuel: "Fuel Used", fuelUnit: "(L)",
      btn: "Calculate Mileage",
      priceLbl: "Fuel Price (per L)",
      perLiterLbl: "km/L", costPerKmLbl: "Cost/km",
      msgs: ["Excellent consumption!", "Good consumption", "High consumption"],
      enter: "Enter distance and fuel used, then press Calculate",
      invalid: "⚠️ Please check the inputs",
    },
    hp: {
      title: "Horsepower Calculator", badge: "Physics",
      force: "Force", forceUnit: "(N)",
      distance: "Distance", distanceUnit: "(m)",
      time: "Time", timeUnit: "(s)",
      btn: "Calculate Power",
      hpLbl: "HP", kwLbl: "kW",
      msgs: ["High power!", "Moderate power"],
      enter: "Enter force, distance and time, then press Calculate",
      invalid: "⚠️ Please check the inputs",
    },
    engine: {
      title: "Engine Horsepower Calculator", badge: "Cars",
      metric: "Metric", imperial: "Imperial",
      etMethod: "ET Method", trapMethod: "Trap Speed",
      formulaET: "HP = Weight ÷ (ET ÷ 5.825)³",
      formulaTrap: "HP = Weight × (Speed ÷ 234)³",
      weight: "Vehicle Weight",
      etTime: "Quarter-mile time (ET)", etTimeUnit: "(s)",
      trapSpeed: "Quarter-mile speed",
      weightMetric: "(kg)", weightImperial: "(lbs)",
      speedMetric: "(km/h)", speedImperial: "(mph)",
      btn: "Calculate Power",
      kwLbl: "kW", psLbl: "PS",
      msgs: ["Super performance!", "Excellent performance!", "Very good performance", "Good performance", "Moderate performance"],
      enter: "Enter weight and timing, then press Calculate",
      invalid: "⚠️ Please check the inputs",
    },
  },
  ar: {
    tabs: { fuel: "⛽ وقود", mileage: "📊 استهلاك", hp: "🏎️ قدرة", engine: "🔧 محرك" },
    fuel: {
      title: "حاسبة تكلفة الوقود", badge: "اقتصادي",
      distance: "المسافة", distanceUnit: "(كم)",
      consumption: "استهلاك الوقود", consumptionUnit: "(لتر/100 كم)",
      price: "سعر الوقود", priceUnit: "(للتر)",
      passengers: "عدد الركاب", passengersUnit: "(لتقسيم التكلفة)",
      btn: "احسب التكلفة",
      fuelUsedLbl: "الوقود المستهلك", perPersonLbl: "لكل شخص",
      msgs: ["رحلة اقتصادية! تكلفة منخفضة", "تكلفة معقولة، خطط لرحلتك جيداً", "تكلفة مرتفعة، فكر في مشاركة الرحلة", "تكلفة عالية جداً، جرب وسائل النقل البديلة"],
      enter: "أدخل تفاصيل الرحلة واضغط على احسب",
      invalid: "⚠️ تأكد من جميع المدخلات",
    },
    mileage: {
      title: "حاسبة المسافة المقطوعة", badge: "استهلاك",
      distance: "المسافة", distanceUnit: "(كم)",
      fuel: "الوقود المستهلك", fuelUnit: "(لتر)",
      btn: "احسب الاستهلاك",
      priceLbl: "سعر الوقود (للتر)",
      perLiterLbl: "كم/لتر", costPerKmLbl: "تكلفة/كم",
      msgs: ["استهلاك ممتاز!", "استهلاك جيد", "استهلاك مرتفع"],
      enter: "أدخل المسافة والوقود المستهلك ثم اضغط احسب",
      invalid: "⚠️ تأكد من المدخلات",
    },
    hp: {
      title: "حاسبة القدرة الحصانية", badge: "فيزياء",
      force: "القوة", forceUnit: "(نيوتن)",
      distance: "المسافة", distanceUnit: "(متر)",
      time: "الزمن", timeUnit: "(ثانية)",
      btn: "احسب القدرة",
      hpLbl: "حصان", kwLbl: "كيلوواط",
      msgs: ["قدرة عالية!", "قدرة متوسطة"],
      enter: "أدخل القوة والمسافة والزمن ثم اضغط احسب",
      invalid: "⚠️ تأكد من المدخلات",
    },
    engine: {
      title: "حاسبة قدرة المحرك", badge: "سيارات",
      metric: "متري", imperial: "إمبراطوري",
      etMethod: "طريقة ET", trapMethod: "طريقة السرعة",
      formulaET: "HP = الوزن ÷ (ET ÷ 5.825)³",
      formulaTrap: "HP = الوزن × (السرعة ÷ 234)³",
      weight: "وزن السيارة",
      etTime: "زمن الربع ميل (ET)", etTimeUnit: "(ثانية)",
      trapSpeed: "سرعة الربع ميل",
      weightMetric: "(كغ)", weightImperial: "(رطل)",
      speedMetric: "(كم/س)", speedImperial: "(ميل/س)",
      btn: "احسب القدرة",
      kwLbl: "كيلوواط", psLbl: "PS",
      msgs: ["أداء خارق!", "أداء ممتاز!", "أداء جيد جداً", "أداء جيد", "أداء معتدل"],
      enter: "أدخل الوزن والتوقيت ثم اضغط احسب",
      invalid: "⚠️ تأكد من المدخلات",
    },
  },
};

function ToolTitle({ title, badge }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <h3 className="text-lg font-bold text-[#1E1B4B] dark:text-[#FEF3C7]">{title}</h3>
      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#E0E7FF] dark:bg-[#4B3F8A] text-[#4F46E5] dark:text-[#A5B4FC]">{badge}</span>
    </div>
  );
}

function ResultBox({ main, unit, subs, message, invalid }) {
  return (
    <div className="mt-6 rounded-[20px] bg-gradient-to-br from-[#1E1B4B] to-[#2D2A5A] border border-[#4B3F8A] p-6 text-center shadow-lg animate-[slideDown_0.3s_ease-out]">
      {invalid ? (
        <div className="text-base font-semibold text-red-300 py-2">{invalid}</div>
      ) : (
        <>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl font-black text-[#8B5CF6] drop-shadow-[0_0_24px_rgba(139,92,246,0.35)]">{main}</span>
            {unit && <span className="text-sm font-bold text-[#A5B4FC]">{unit}</span>}
          </div>
          {subs && subs.length > 0 && (
            <div className="flex justify-center gap-5 flex-wrap mt-3 text-sm text-[#94A3B8]">
              {subs.map((sub, i) => (
                <span key={i}>{sub.lbl} <strong className="text-[#F1F5F9] font-bold">{sub.val}</strong></span>
              ))}
            </div>
          )}
          {message && <div className="text-xs mt-3 text-[#A5B4FC] font-medium">{message}</div>}
        </>
      )}
    </div>
  );
}

function FormulaBox({ children }) {
  return (
    <div className="rounded-2xl bg-[#1E1B4B] dark:bg-black/40 border border-[#4B3F8A] px-4 py-2.5 mb-4 text-center text-sm font-mono text-[#A5B4FC]" dir="ltr">
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2 mb-4">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${value === opt.value ? "bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white border border-[#F59E0B] shadow-[0_4px_12px_rgba(109,40,217,0.3)]" : "bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] text-[#475569] dark:text-[#A8A6C4] hover:border-[#6D28D9]"}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---- 1. Fuel Cost ----
function FuelCalc({ s }) {
  const [dist, setDist] = useState("100");
  const [cons, setCons] = useState("7.5");
  const [price, setPrice] = useState("2.3");
  const [passengers, setPassengers] = useState("1");
  const [res, setRes] = useState(null);

  const calc = () => {
    const d = parseFloat(dist), c = parseFloat(cons), p = parseFloat(price), n = parseInt(passengers) || 1;
    if (!d || d <= 0 || !c || c <= 0 || !p || p <= 0) { setRes({ invalid: s.invalid }); return; }
    const fuelNeeded = (d / 100) * c;
    const totalCost = fuelNeeded * p;
    const per = totalCost / n;
    let idx = 0;
    if (totalCost >= 100) idx = 3; else if (totalCost >= 50) idx = 2; else if (totalCost >= 20) idx = 1;
    setRes({
      main: totalCost.toFixed(2), unit: "",
      subs: [{ lbl: "⛽", val: `${fuelNeeded.toFixed(1)} L` }, { lbl: "👤", val: per.toFixed(2) }],
      message: s.msgs[idx],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} badge={s.badge} />
      <div className="space-y-3">
        <NumInput label={`${s.distance} ${s.distanceUnit}`} value={dist} onChange={(e) => setDist(e.target.value)} placeholder="100" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label={`${s.consumption} ${s.consumptionUnit}`} value={cons} onChange={(e) => setCons(e.target.value)} placeholder="7.5" />
          <NumInput label={`${s.price} ${s.priceUnit}`} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2.3" />
        </div>
        <NumInput label={`${s.passengers} ${s.passengersUnit}`} value={passengers} onChange={(e) => setPassengers(e.target.value)} placeholder="1" />
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res ? <ResultBox {...res} /> : <p className="mt-6 text-center text-sm text-muted-foreground">{s.enter}</p>}
    </div>
  );
}

// ---- 2. Gas Mileage ----
function MileageCalc({ s }) {
  const [dist, setDist] = useState("300");
  const [fuel, setFuel] = useState("25");
  const [price, setPrice] = useState("2.3");
  const [res, setRes] = useState(null);

  const calc = () => {
    const d = parseFloat(dist), f = parseFloat(fuel), p = parseFloat(price);
    if (!d || d <= 0 || !f || f <= 0) { setRes({ invalid: s.invalid }); return; }
    const lPer100 = (f / d) * 100;
    const kmPerL = d / f;
    const costPerKm = (lPer100 / 100) * (p || 0);
    const idx = lPer100 < 6 ? 0 : lPer100 < 10 ? 1 : 2;
    setRes({
      main: lPer100.toFixed(2), unit: "L/100km",
      subs: [{ lbl: "📏", val: `${kmPerL.toFixed(2)} ${s.perLiterLbl}` }, { lbl: "💰", val: `${costPerKm.toFixed(2)}` }],
      message: s.msgs[idx],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} badge={s.badge} />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <NumInput label={`${s.distance} ${s.distanceUnit}`} value={dist} onChange={(e) => setDist(e.target.value)} placeholder="300" />
          <NumInput label={`${s.fuel} ${s.fuelUnit}`} value={fuel} onChange={(e) => setFuel(e.target.value)} placeholder="25" />
        </div>
        <NumInput label={s.priceLbl} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2.3" />
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res ? <ResultBox {...res} /> : <p className="mt-6 text-center text-sm text-muted-foreground">{s.enter}</p>}
    </div>
  );
}

// ---- 3. Horsepower (general) ----
function HpCalc({ s }) {
  const [force, setForce] = useState("1000");
  const [dist, setDist] = useState("50");
  const [time, setTime] = useState("10");
  const [res, setRes] = useState(null);

  const calc = () => {
    const f = parseFloat(force), d = parseFloat(dist), t = parseFloat(time);
    if (isNaN(f) || f < 0 || isNaN(d) || d < 0 || isNaN(t) || t <= 0) { setRes({ invalid: s.invalid }); return; }
    const watts = (f * d) / t;
    const hp = watts / 745.699872;
    const kw = watts / 1000;
    setRes({
      main: watts.toFixed(2), unit: "W",
      subs: [{ lbl: "🐴", val: `${hp.toFixed(2)} ${s.hpLbl}` }, { lbl: "⚡", val: `${kw.toFixed(2)} ${s.kwLbl}` }],
      message: s.msgs[hp > 10 ? 0 : 1],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} badge={s.badge} />
      <div className="space-y-3">
        <NumInput label={`${s.force} ${s.forceUnit}`} value={force} onChange={(e) => setForce(e.target.value)} placeholder="1000" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label={`${s.distance} ${s.distanceUnit}`} value={dist} onChange={(e) => setDist(e.target.value)} placeholder="50" />
          <NumInput label={`${s.time} ${s.timeUnit}`} value={time} onChange={(e) => setTime(e.target.value)} placeholder="10" />
        </div>
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res ? <ResultBox {...res} /> : <p className="mt-6 text-center text-sm text-muted-foreground">{s.enter}</p>}
    </div>
  );
}

// ---- 4. Engine Horsepower ----
function EngineCalc({ s }) {
  const [unit, setUnit] = useState("metric");
  const [method, setMethod] = useState("et");
  const [weightET, setWeightET] = useState("1500");
  const [etTime, setEtTime] = useState("14.5");
  const [weightTrap, setWeightTrap] = useState("1500");
  const [trapSpeed, setTrapSpeed] = useState("160");
  const [resET, setResET] = useState(null);
  const [resTrap, setResTrap] = useState(null);

  const wUnit = unit === "metric" ? s.weightMetric : s.weightImperial;
  const sUnit = unit === "metric" ? s.speedMetric : s.speedImperial;

  const calcET = () => {
    const w = parseFloat(weightET), et = parseFloat(etTime);
    if (!w || w <= 0 || !et || et <= 0) { setResET({ invalid: s.invalid }); return; }
    const wLbs = unit === "metric" ? w * 2.20462 : w;
    const hp = wLbs / Math.pow(et / 5.825, 3);
    setResET({
      main: hp.toFixed(2), unit: "HP",
      subs: [{ lbl: "⚡", val: `${(hp * 0.7457).toFixed(2)} ${s.kwLbl}` }, { lbl: "📊", val: `${(hp * 1.01387).toFixed(2)} ${s.psLbl}` }],
      message: s.msgs[hptier(hp / wLbs)],
    });
  };

  const calcTrap = () => {
    const w = parseFloat(weightTrap), sp = parseFloat(trapSpeed);
    if (!w || w <= 0 || !sp || sp <= 0) { setResTrap({ invalid: s.invalid }); return; }
    const wLbs = unit === "metric" ? w * 2.20462 : w;
    const sMph = unit === "metric" ? sp * 0.621371 : sp;
    const hp = wLbs * Math.pow(sMph / 234, 3);
    setResTrap({
      main: hp.toFixed(2), unit: "HP",
      subs: [{ lbl: "⚡", val: `${(hp * 0.7457).toFixed(2)} ${s.kwLbl}` }, { lbl: "📊", val: `${(hp * 1.01387).toFixed(2)} ${s.psLbl}` }],
      message: s.msgs[hptier(hp / wLbs)],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} badge={s.badge} />
      <ToggleGroup options={[{ value: "metric", label: `📏 ${s.metric}` }, { value: "imperial", label: `📏 ${s.imperial}` }]} value={unit} onChange={setUnit} />
      <ToggleGroup options={[{ value: "et", label: `⏱️ ${s.etMethod}` }, { value: "trap", label: `🏁 ${s.trapMethod}` }]} value={method} onChange={setMethod} />

      {method === "et" ? (
        <div>
          <FormulaBox>{s.formulaET}</FormulaBox>
          <div className="space-y-3">
            <NumInput label={`${s.weight} ${wUnit}`} value={weightET} onChange={(e) => setWeightET(e.target.value)} placeholder="1500" />
            <NumInput label={`${s.etTime} ${s.etTimeUnit}`} value={etTime} onChange={(e) => setEtTime(e.target.value)} placeholder="14.5" />
          </div>
          <CalcButton onClick={calcET}>{s.btn}</CalcButton>
          {resET ? <ResultBox {...resET} /> : <p className="mt-6 text-center text-sm text-muted-foreground">{s.enter}</p>}
        </div>
      ) : (
        <div>
          <FormulaBox>{s.formulaTrap}</FormulaBox>
          <div className="space-y-3">
            <NumInput label={`${s.weight} ${wUnit}`} value={weightTrap} onChange={(e) => setWeightTrap(e.target.value)} placeholder="1500" />
            <NumInput label={`${s.trapSpeed} ${sUnit}`} value={trapSpeed} onChange={(e) => setTrapSpeed(e.target.value)} placeholder="160" />
          </div>
          <CalcButton onClick={calcTrap}>{s.btn}</CalcButton>
          {resTrap ? <ResultBox {...resTrap} /> : <p className="mt-6 text-center text-sm text-muted-foreground">{s.enter}</p>}
        </div>
      )}
    </div>
  );
}

function hptier(ratio) {
  if (ratio > 0.15) return 0;
  if (ratio > 0.10) return 1;
  if (ratio > 0.07) return 2;
  if (ratio > 0.05) return 3;
  return 4;
}

export default function CarTools() {
  const { lang } = useI18n();
  const s = STR[lang] || STR.en;
  const [tab, setTab] = useState("fuel");
  const tabs = ["fuel", "mileage", "hp", "engine"];

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${tab === k ? "bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white border border-[#F59E0B] shadow-[0_4px_14px_rgba(109,40,217,0.3)]" : "bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] text-[#475569] dark:text-[#A8A6C4] hover:border-[#6D28D9] hover:text-[#6D28D9]"}`}>
            {s.tabs[k]}
          </button>
        ))}
      </div>

      {tab === "fuel" && <FuelCalc s={s.fuel} />}
      {tab === "mileage" && <MileageCalc s={s.mileage} />}
      {tab === "hp" && <HpCalc s={s.hp} />}
      {tab === "engine" && <EngineCalc s={s.engine} />}
    </div>
  );
}