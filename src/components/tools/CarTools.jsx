import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { NumInput, CalcButton, SelectField } from "@/components/tools/ToolUI";

const STR = {
  en: {
    tabs: { fuel: "⛽ Fuel Cost", mileage: "📊 Mileage", hp: "🐎 Horsepower", engine: "⚙️ Engine Power" },
    fuel: {
      title: "Trip Fuel Cost Calculator",
      distance: "Distance (km)",
      consumption: "Fuel Consumption (L/100km)",
      price: "Fuel Price (per L)",
      passengers: "Passengers (to split cost)",
      btn: "Calculate Fuel Cost",
      results: { total: "Total Cost", fuelNeeded: "Fuel Needed", perPerson: "Per Person", perKm: "Cost per km" },
      note: "💡 Example: A 500 km trip with 8 L/100km and 2.5/L fuel = 40 L × 2.5 = $100.",
      enter: "Enter your trip details and press Calculate",
      invalid: "⚠️ Please check all inputs",
    },
    mileage: {
      title: "Gas Mileage Calculator",
      distance: "Distance Driven (km)",
      fuel: "Fuel Used (L)",
      price: "Fuel Price (per L) — optional",
      btn: "Calculate Mileage",
      results: { l100: "Consumption", kml: "Efficiency", mpg: "MPG (US)", costKm: "Cost per km" },
      units: { l100: "L/100km", kml: "km/L", mpg: "MPG", costKm: "currency/km" },
      note: "📊 Modern cars typically consume 6–9 L/100km. Below 6 = excellent, above 12 = high.",
      enter: "Enter distance and fuel used, then press Calculate",
      invalid: "⚠️ Please check the inputs",
    },
    hp: {
      title: "Horsepower Calculator (Force, Distance, Time)",
      force: "Force (N)",
      distance: "Distance (m)",
      time: "Time (s)",
      btn: "Calculate Power",
      results: { watts: "Power", hp: "Mechanical HP", ps: "Metric HP", kw: "Kilowatts" },
      units: { watts: "W", hp: "HP", ps: "PS", kw: "kW" },
      note: "🔧 Formula: Power (W) = Force × Distance ÷ Time. Mechanical HP = 745.7 W, Metric = 735.5 W.",
      enter: "Enter force, distance and time, then press Calculate",
      invalid: "⚠️ Please check the inputs",
    },
    engine: {
      title: "Engine Horsepower Calculator (ET / Trap Speed)",
      methodLbl: "Calculation Method",
      etMethod: "ET Method (Time)",
      trapMethod: "Trap Speed Method",
      weight: "Vehicle Weight (kg)",
      etTime: "Quarter-mile Time ET (s)",
      trapSpeed: "Quarter-mile Speed (km/h)",
      btn: "Calculate Engine Power",
      results: { hp: "Estimated Power", kw: "Kilowatts", ps: "Metric HP", ratio: "Weight / Power" },
      units: { hp: "HP", kw: "kW", ps: "PS", ratio: "kg/HP" },
      note: "⚙️ ET Method: HP = Weight ÷ (ET ÷ 5.825)³. Trap: HP = Weight × (Speed_mph ÷ 234)³. Values are estimates.",
      enter: "Enter weight and timing, then press Calculate",
      invalid: "⚠️ Please check the inputs",
    },
  },
  ar: {
    tabs: { fuel: "⛽ تكلفة الوقود", mileage: "📊 الاستهلاك", hp: "🐎 القوة الحصانية", engine: "⚙️ قوة المحرك" },
    fuel: {
      title: "حاسبة تكلفة الوقود للرحلة",
      distance: "المسافة (كم)",
      consumption: "استهلاك الوقود (لتر/100كم)",
      price: "سعر اللتر",
      passengers: "عدد الركاب (لتقسيم التكلفة)",
      btn: "احسب تكلفة الوقود",
      results: { total: "التكلفة الإجمالية", fuelNeeded: "الوقود المطلوب", perPerson: "التكلفة للفرد", perKm: "تكلفة الكيلومتر" },
      note: "💡 مثال: رحلة 500 كم بسيارة تستهلك 8 لتر/100كم وسعر اللتر 2.5 = 40 لتراً × 2.5 = 100.",
      enter: "أدخل تفاصيل الرحلة واضغط على احسب",
      invalid: "⚠️ تأكد من جميع المدخلات",
    },
    mileage: {
      title: "حاسبة استهلاك البنزين (الميلاج)",
      distance: "المسافة المقطوعة (كم)",
      fuel: "الوقود المستهلك (لتر)",
      price: "سعر اللتر (اختياري)",
      btn: "احسب الاستهلاك",
      results: { l100: "الاستهلاك", kml: "الكفاءة", mpg: "ميل/غالون", costKm: "التكلفة لكل كم" },
      units: { l100: "لتر/100كم", kml: "كم/لتر", mpg: "MPG", costKm: "لكل كم" },
      note: "📊 السيارات الحديثة تستهلك عادة 6-9 لتر/100كم. أقل من 6 = ممتاز، أكثر من 12 = مرتفع.",
      enter: "أدخل المسافة والوقود المستهلك ثم اضغط احسب",
      invalid: "⚠️ تأكد من المدخلات",
    },
    hp: {
      title: "حاسبة القوة الحصانية (القوة والمسافة والزمن)",
      force: "القوة (نيوتن)",
      distance: "المسافة (متر)",
      time: "الزمن (ثانية)",
      btn: "احسب القدرة",
      results: { watts: "القدرة", hp: "حصان ميكانيكي", ps: "حصان متري", kw: "كيلوواط" },
      units: { watts: "واط", hp: "HP", ps: "PS", kw: "kW" },
      note: "🔧 المعادلة: القدرة (واط) = القوة × المسافة ÷ الزمن. الحصان الميكانيكي = 745.7 واط، المتري = 735.5 واط.",
      enter: "أدخل القوة والمسافة والزمن ثم اضغط احسب",
      invalid: "⚠️ تأكد من المدخلات",
    },
    engine: {
      title: "حاسبة قوة المحرك (طريقة ET / الربع ميل)",
      methodLbl: "طريقة الحساب",
      etMethod: "طريقة ET (الزمن)",
      trapMethod: "طريقة سرعة المصيدة",
      weight: "وزن السيارة (كجم)",
      etTime: "زمن الربع ميل (ثانية)",
      trapSpeed: "سرعة الربع ميل (كم/س)",
      btn: "احسب قوة المحرك",
      results: { hp: "القوة التقديرية", kw: "بالكيلوواط", ps: "بالحصان المتري", ratio: "الوزن/القوة" },
      units: { hp: "HP", kw: "kW", ps: "PS", ratio: "كجم/HP" },
      note: "⚙️ طريقة ET: HP = الوزن ÷ (ET ÷ 5.825)³. السرعة: HP = الوزن × (السرعة_ميل/س ÷ 234)³. القيم تقديرية.",
      enter: "أدخل الوزن والتوقيت ثم اضغط احسب",
      invalid: "⚠️ تأكد من المدخلات",
    },
  },
};

const fmt = (n, d = 2) => {
  if (!isFinite(n) || isNaN(n)) return "—";
  return String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d));
};

function ToolTitle({ title }) {
  return (
    <h3 className="text-lg font-bold text-[#111827] dark:text-[#FEF3C7] mb-5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#6D28D9] shrink-0" />
      {title}
    </h3>
  );
}

function ResultGrid({ children }) {
  return (
    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-[slideDown_0.3s_ease-out]">
      {children}
    </div>
  );
}

function ResultCard({ lbl, val, unit, primary }) {
  return (
    <div className={`rounded-xl border p-3.5 text-center transition-colors duration-300 ${primary ? "bg-gradient-to-br from-[#6D28D9]/8 to-[#F59E0B]/6 border-[#F59E0B]/30 dark:border-[#F59E0B]/30" : "bg-[#F9FAFB] dark:bg-[#1E1B4B] border-[#F3F4F6] dark:border-[#4B3F8A]"}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-[#A8A6C4] mb-1.5">{lbl}</div>
      <div className={`font-extrabold font-mono tabular-nums text-[#111827] dark:text-[#FEF3C7] ${primary ? "text-2xl" : "text-xl"}`}>{val}</div>
      <div className="text-xs text-[#6B7280] dark:text-[#A8A6C4] mt-0.5">{unit}</div>
    </div>
  );
}

function NoteBox({ children }) {
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#FFFBEB] dark:bg-[#2D2A5A] border border-[#FDE68A] dark:border-[#4B3F8A] p-3.5 text-xs text-[#374151] dark:text-[#D6D2EE] leading-relaxed transition-colors duration-300">
      {children}
    </div>
  );
}

function Placeholder({ text }) {
  return <p className="mt-6 text-center text-sm text-[#6B7280] dark:text-[#A8A6C4]">{text}</p>;
}

function Invalid({ text }) {
  return <p className="mt-6 text-center text-sm font-semibold text-red-500 dark:text-red-400">{text}</p>;
}

// ---- 1. Fuel Cost ----
function FuelCalc({ s }) {
  const [dist, setDist] = useState("500");
  const [cons, setCons] = useState("8");
  const [price, setPrice] = useState("2.5");
  const [passengers, setPassengers] = useState("1");
  const [res, setRes] = useState(null);

  const calc = () => {
    const d = parseFloat(dist), c = parseFloat(cons), p = parseFloat(price), n = parseInt(passengers) || 1;
    if (!d || d <= 0 || !c || c <= 0 || !p || p <= 0) { setRes({ invalid: true }); return; }
    const litres = (d / 100) * c;
    const total = litres * p;
    const perPerson = total / n;
    const perKm = total / d;
    setRes({
      cards: [
        { lbl: s.results.total, val: fmt(total), unit: "", primary: true },
        { lbl: s.results.fuelNeeded, val: fmt(litres, 1), unit: "L" },
        { lbl: s.results.perPerson, val: fmt(perPerson), unit: "" },
        { lbl: s.results.perKm, val: fmt(perKm, 3), unit: "" },
      ],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <NumInput label={s.distance} value={dist} onChange={(e) => setDist(e.target.value)} placeholder="500" />
          <NumInput label={s.consumption} value={cons} onChange={(e) => setCons(e.target.value)} placeholder="8" />
          <NumInput label={s.price} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2.5" />
          <NumInput label={s.passengers} value={passengers} onChange={(e) => setPassengers(e.target.value)} placeholder="1" />
        </div>
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res?.invalid ? <Invalid text={s.invalid} /> : res ? <ResultGrid>{res.cards.map((c, i) => <ResultCard key={i} {...c} />)}</ResultGrid> : <Placeholder text={s.enter} />}
      <NoteBox>{s.note}</NoteBox>
    </div>
  );
}

// ---- 2. Gas Mileage ----
function MileageCalc({ s }) {
  const [dist, setDist] = useState("450");
  const [fuel, setFuel] = useState("35");
  const [price, setPrice] = useState("2.5");
  const [res, setRes] = useState(null);

  const calc = () => {
    const d = parseFloat(dist), f = parseFloat(fuel), p = parseFloat(price);
    if (!d || d <= 0 || !f || f <= 0) { setRes({ invalid: true }); return; }
    const l100 = (f / d) * 100;
    const kml = d / f;
    const mpg = 235.215 / l100;
    const costKm = p > 0 ? (f * p) / d : 0;
    setRes({
      cards: [
        { lbl: s.results.l100, val: fmt(l100), unit: s.units.l100, primary: true },
        { lbl: s.results.kml, val: fmt(kml), unit: s.units.kml },
        { lbl: s.results.mpg, val: fmt(mpg, 1), unit: s.units.mpg },
        { lbl: s.results.costKm, val: p > 0 ? fmt(costKm, 3) : "—", unit: "" },
      ],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <NumInput label={s.distance} value={dist} onChange={(e) => setDist(e.target.value)} placeholder="450" />
          <NumInput label={s.fuel} value={fuel} onChange={(e) => setFuel(e.target.value)} placeholder="35" />
        </div>
        <NumInput label={s.price} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2.5" />
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res?.invalid ? <Invalid text={s.invalid} /> : res ? <ResultGrid>{res.cards.map((c, i) => <ResultCard key={i} {...c} />)}</ResultGrid> : <Placeholder text={s.enter} />}
      <NoteBox>{s.note}</NoteBox>
    </div>
  );
}

// ---- 3. Horsepower (general) ----
function HpCalc({ s }) {
  const [force, setForce] = useState("5000");
  const [dist, setDist] = useState("100");
  const [time, setTime] = useState("5");
  const [res, setRes] = useState(null);

  const calc = () => {
    const f = parseFloat(force), d = parseFloat(dist), t = parseFloat(time);
    if (!f || f <= 0 || !d || d <= 0 || !t || t <= 0) { setRes({ invalid: true }); return; }
    const watts = (f * d) / t;
    const hp = watts / 745.7;
    const ps = watts / 735.5;
    const kw = watts / 1000;
    setRes({
      cards: [
        { lbl: s.results.watts, val: fmt(watts, 1), unit: s.units.watts, primary: true },
        { lbl: s.results.hp, val: fmt(hp), unit: s.units.hp },
        { lbl: s.results.ps, val: fmt(ps), unit: s.units.ps },
        { lbl: s.results.kw, val: fmt(kw), unit: s.units.kw },
      ],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} />
      <div className="space-y-3">
        <NumInput label={s.force} value={force} onChange={(e) => setForce(e.target.value)} placeholder="5000" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label={s.distance} value={dist} onChange={(e) => setDist(e.target.value)} placeholder="100" />
          <NumInput label={s.time} value={time} onChange={(e) => setTime(e.target.value)} placeholder="5" />
        </div>
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res?.invalid ? <Invalid text={s.invalid} /> : res ? <ResultGrid>{res.cards.map((c, i) => <ResultCard key={i} {...c} />)}</ResultGrid> : <Placeholder text={s.enter} />}
      <NoteBox>{s.note}</NoteBox>
    </div>
  );
}

// ---- 4. Engine Horsepower ----
function EngineCalc({ s }) {
  const [method, setMethod] = useState("et");
  const [weight, setWeight] = useState("1500");
  const [etTime, setEtTime] = useState("14");
  const [trapSpeed, setTrapSpeed] = useState("160");
  const [res, setRes] = useState(null);

  const methodOptions = [
    { value: "et", label: s.etMethod },
    { value: "trap", label: s.trapMethod },
  ];

  const calc = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) { setRes({ invalid: true }); return; }
    let hp;
    if (method === "et") {
      const et = parseFloat(etTime);
      if (!et || et <= 0) { setRes({ invalid: true }); return; }
      hp = w / Math.pow(et / 5.825, 3);
    } else {
      const sp = parseFloat(trapSpeed);
      if (!sp || sp <= 0) { setRes({ invalid: true }); return; }
      const mph = sp * 0.621371;
      hp = w * Math.pow(mph / 234, 3);
    }
    const kw = hp * 0.7457;
    const ps = hp * 1.0139;
    const ratio = w / hp;
    setRes({
      cards: [
        { lbl: s.results.hp, val: fmt(hp, 1), unit: s.units.hp, primary: true },
        { lbl: s.results.kw, val: fmt(kw, 1), unit: s.units.kw },
        { lbl: s.results.ps, val: fmt(ps, 1), unit: s.units.ps },
        { lbl: s.results.ratio, val: fmt(ratio), unit: s.units.ratio },
      ],
    });
  };

  return (
    <div>
      <ToolTitle title={s.title} />
      <SelectField label={s.methodLbl} value={method} onChange={(e) => setMethod(e.target.value)} options={methodOptions} />
      <div className="space-y-3">
        <NumInput label={s.weight} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="1500" />
        {method === "et" ? (
          <NumInput label={s.etTime} value={etTime} onChange={(e) => setEtTime(e.target.value)} placeholder="14" />
        ) : (
          <NumInput label={s.trapSpeed} value={trapSpeed} onChange={(e) => setTrapSpeed(e.target.value)} placeholder="160" />
        )}
      </div>
      <CalcButton onClick={calc}>{s.btn}</CalcButton>
      {res?.invalid ? <Invalid text={s.invalid} /> : res ? <ResultGrid>{res.cards.map((c, i) => <ResultCard key={i} {...c} />)}</ResultGrid> : <Placeholder text={s.enter} />}
      <NoteBox>{s.note}</NoteBox>
    </div>
  );
}

export default function CarTools() {
  const { lang, isRTL } = useI18n();
  const s = STR[lang] || STR.en;
  const [tab, setTab] = useState("fuel");
  const tabs = ["fuel", "mileage", "hp", "engine"];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full">
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