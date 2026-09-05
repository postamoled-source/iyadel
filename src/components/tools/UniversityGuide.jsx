import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Search, RefreshCw, AlertCircle, Building2, ExternalLink, Calculator,
  GraduationCap, Users, TrendingUp, DollarSign, Globe2,
} from "lucide-react";

const API_KEY = "DEMO_KEY";
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
const FIELDS = [
  "id", "school.name", "school.city", "school.state",
  "latest.cost.tuition.in_state", "latest.cost.tuition.out_of_state",
  "latest.cost.avg_net_price.overall", "latest.admissions.admission_rate.overall",
  "latest.student.size", "latest.completion.rate.overall",
  "school.school_url", "school.price_calculator_url",
].join(",");

const US_STATES = [
  { code: "AL", ar: "ألاباما", en: "Alabama" },
  { code: "AK", ar: "ألاسكا", en: "Alaska" },
  { code: "AZ", ar: "أريزونا", en: "Arizona" },
  { code: "AR", ar: "أركنساس", en: "Arkansas" },
  { code: "CA", ar: "كاليفورنيا", en: "California" },
  { code: "CO", ar: "كولورادو", en: "Colorado" },
  { code: "CT", ar: "كونيتيكت", en: "Connecticut" },
  { code: "DE", ar: "ديلاوير", en: "Delaware" },
  { code: "FL", ar: "فلوريدا", en: "Florida" },
  { code: "GA", ar: "جورجيا", en: "Georgia" },
  { code: "HI", ar: "هاواي", en: "Hawaii" },
  { code: "ID", ar: "أيداهو", en: "Idaho" },
  { code: "IL", ar: "إلينوي", en: "Illinois" },
  { code: "IN", ar: "إنديانا", en: "Indiana" },
  { code: "IA", ar: "آيوا", en: "Iowa" },
  { code: "KS", ar: "كانساس", en: "Kansas" },
  { code: "KY", ar: "كنتاكي", en: "Kentucky" },
  { code: "LA", ar: "لويزيانا", en: "Louisiana" },
  { code: "ME", ar: "مين", en: "Maine" },
  { code: "MD", ar: "ماريلاند", en: "Maryland" },
  { code: "MA", ar: "ماساتشوستس", en: "Massachusetts" },
  { code: "MI", ar: "ميشيغان", en: "Michigan" },
  { code: "MN", ar: "مينيسوتا", en: "Minnesota" },
  { code: "MS", ar: "ميسيسيبي", en: "Mississippi" },
  { code: "MO", ar: "ميزوري", en: "Missouri" },
  { code: "MT", ar: "مونتانا", en: "Montana" },
  { code: "NE", ar: "نبراسكا", en: "Nebraska" },
  { code: "NV", ar: "نيفادا", en: "Nevada" },
  { code: "NH", ar: "نيوهامبشير", en: "New Hampshire" },
  { code: "NJ", ar: "نيوجيرسي", en: "New Jersey" },
  { code: "NM", ar: "نيومكسيكو", en: "New Mexico" },
  { code: "NY", ar: "نيويورك", en: "New York" },
  { code: "NC", ar: "كارولاينا الشمالية", en: "North Carolina" },
  { code: "ND", ar: "داكوتا الشمالية", en: "North Dakota" },
  { code: "OH", ar: "أوهايو", en: "Ohio" },
  { code: "OK", ar: "أوكلاهوما", en: "Oklahoma" },
  { code: "OR", ar: "أوريغون", en: "Oregon" },
  { code: "PA", ar: "بنسلفانيا", en: "Pennsylvania" },
  { code: "RI", ar: "رود آيلاند", en: "Rhode Island" },
  { code: "SC", ar: "كارولاينا الجنوبية", en: "South Carolina" },
  { code: "SD", ar: "داكوتا الجنوبية", en: "South Dakota" },
  { code: "TN", ar: "تينيسي", en: "Tennessee" },
  { code: "TX", ar: "تكساس", en: "Texas" },
  { code: "UT", ar: "يوتا", en: "Utah" },
  { code: "VT", ar: "فيرمونت", en: "Vermont" },
  { code: "VA", ar: "فرجينيا", en: "Virginia" },
  { code: "WA", ar: "واشنطن", en: "Washington" },
  { code: "WV", ar: "فيرجينيا الغربية", en: "West Virginia" },
  { code: "WI", ar: "ويسكونسن", en: "Wisconsin" },
  { code: "WY", ar: "وايومنغ", en: "Wyoming" },
];

const STR = {
  en: {
    subtitle: "Search any US college and discover the annual net cost after grants & financial aid",
    subtitleHint: "Accurate tuition, admission & completion data from the US Dept of Education",
    nameLabel: "College Name",
    namePlaceholder: "e.g. Harvard, MIT, Stanford...",
    stateLabel: "State",
    allStates: "All States",
    searchBtn: "Search",
    searching: "Searching...",
    results: "Results",
    countSuffix: "colleges",
    loading: "Searching for colleges...",
    errorTitle: "An error occurred during search",
    errorRetry: "Please try again",
    retryBtn: "Retry",
    emptyTitle: "No colleges found matching your search",
    emptyHint: "Try changing the name or state",
    initialState: "Search for a college to start",
    initialStateHint: "Enter a college name or select a state",
    netPriceLabel: "Net Price (after grants & aid)",
    perYear: "/ year",
    tuitionIn: "Tuition (In-State)",
    tuitionOut: "Tuition (Out-of-State)",
    admissionRate: "Admission Rate",
    studentSize: "Student Body",
    completionRate: "Graduation Rate",
    calculatorBtn: "Cost Calculator",
    websiteBtn: "Official Website",
    noCalculator: "No cost calculator link provided by this institution",
    footerData: "Data provided by",
    footerApi: "US Dept of Education — College Scorecard",
  },
  ar: {
    subtitle: "ابحث عن أي كلية أمريكية واكتشف صافي التكلفة السنوية بعد المنح والمساعدات المالية",
    subtitleHint: "بيانات دقيقة عن الرسوم والقبول والتخرج من وزارة التعليم الأمريكية",
    nameLabel: "اسم الكلية",
    namePlaceholder: "مثال: Harvard, MIT, Stanford...",
    stateLabel: "الولاية",
    allStates: "جميع الولايات",
    searchBtn: "بحث",
    searching: "جاري البحث...",
    results: "النتائج",
    countSuffix: "كلية",
    loading: "جاري البحث عن الكليات...",
    errorTitle: "حدث خطأ أثناء البحث",
    errorRetry: "يرجى المحاولة مرة أخرى",
    retryBtn: "إعادة المحاولة",
    emptyTitle: "لم يتم العثور على كليات تطابق بحثك",
    emptyHint: "حاول تغيير الاسم أو الولاية",
    initialState: "ابحث عن كلية لبدء العرض",
    initialStateHint: "أدخل اسم الكلية أو اختر ولاية",
    netPriceLabel: "صافي التكلفة (بعد المنح والمساعدات)",
    perYear: "/ سنة",
    tuitionIn: "الرسوم (داخل الولاية)",
    tuitionOut: "الرسوم (خارج الولاية)",
    admissionRate: "نسبة القبول",
    studentSize: "عدد الطلاب",
    completionRate: "معدل التخرج",
    calculatorBtn: "حاسبة التكلفة",
    websiteBtn: "الموقع الرسمي",
    noCalculator: "لم يتم توفير رابط لحاسبة التكلفة من هذه المؤسسة",
    footerData: "البيانات مقدمة من",
    footerApi: "وزارة التعليم الأمريكية — College Scorecard",
  },
};

const fmtCurrency = (v) => (v === null || v === undefined || isNaN(v) ? "—" : "$" + Number(v).toLocaleString());
const fmtPercent = (v) => (v === null || v === undefined || isNaN(v) ? "—" : (v * 100).toFixed(1) + "%");
const fmtNumber = (v) => (v === null || v === undefined || isNaN(v) ? "—" : Number(v).toLocaleString());

function StatItem({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-[#8B8AB0] uppercase tracking-wide flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className={`text-[14px] font-bold ${highlight ? "text-[#0d9488] dark:text-[#2dd4bf] text-[16px]" : "text-[#1E1B4B] dark:text-[#FEF3C7]"}`}>{value}</span>
    </div>
  );
}

function SchoolCard({ school, s, lang, stateMap }) {
  const name = school["school.name"] || (lang === "ar" ? "اسم غير معروف" : "Unknown");
  const city = school["school.city"] || "";
  const stateCode = school["school.state"] || "";
  const stateName = stateCode ? (stateMap[stateCode]?.[lang] || stateCode) : "";
  const location = [city, stateName].filter(Boolean).join(lang === "ar" ? "، " : ", ");
  const netPrice = school["latest.cost.avg_net_price.overall"];
  const tuitionIn = school["latest.cost.tuition.in_state"];
  const tuitionOut = school["latest.cost.tuition.out_of_state"];
  const admissionRate = school["latest.admissions.admission_rate.overall"];
  const studentSize = school["latest.student.size"];
  const completionRate = school["latest.completion.rate.overall"];
  const calculatorUrl = school["school.price_calculator_url"];
  const schoolUrl = school["school.school_url"];

  return (
    <div className="rounded-2xl bg-[#FFFEF5] dark:bg-[#2D2A5A] border border-[#FFE8A0] dark:border-[#4B3F8A] p-5 transition-all duration-200 hover:border-[#F59E0B] hover:shadow-[0_8px_30px_rgba(109,40,217,0.08)]">
      <div className="flex items-start gap-2 mb-1">
        <GraduationCap className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
        <h4 className="text-[17px] font-bold text-[#1E1B4B] dark:text-[#FEF3C7] leading-tight flex-1">{name}</h4>
      </div>
      <p className="text-[13px] text-[#6B7280] dark:text-[#A8A6C4] mb-3 ml-7">
        📍 {location || (lang === "ar" ? "معلومات الموقع غير متوفرة" : "Location unavailable")}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
        <StatItem icon={DollarSign} label={s.tuitionIn} value={fmtCurrency(tuitionIn)} />
        <StatItem icon={DollarSign} label={s.tuitionOut} value={fmtCurrency(tuitionOut)} />
        <StatItem icon={TrendingUp} label={s.admissionRate} value={fmtPercent(admissionRate)} />
        <StatItem icon={Users} label={s.studentSize} value={fmtNumber(studentSize)} />
        <StatItem icon={GraduationCap} label={s.completionRate} value={fmtPercent(completionRate)} />
        <StatItem icon={DollarSign} label={s.netPriceLabel} value={fmtCurrency(netPrice)} highlight />
      </div>

      <div className="pt-3 border-t border-dashed border-[#E9D5FF] dark:border-[#4B3F8A] flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[11px] text-[#475569] dark:text-[#A8A6C4] block">{s.netPriceLabel}</span>
          <span className="text-[20px] font-bold text-[#0d9488] dark:text-[#2dd4bf]">
            {fmtCurrency(netPrice)} <span className="text-[11px] font-normal text-[#94a3b8]">{s.perYear}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {calculatorUrl && (
            <a href={calculatorUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0d9488] text-white text-[11px] font-semibold hover:bg-[#0f766e] transition-colors">
              <Calculator className="w-3.5 h-3.5" /> {s.calculatorBtn}
            </a>
          )}
          {schoolUrl && (
            <a href={schoolUrl.startsWith("http") ? schoolUrl : `https://${schoolUrl}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#E5E7EB] dark:border-[#4B3F8A] text-[#6B7280] dark:text-[#A8A6C4] text-[11px] font-semibold hover:border-[#0d9488] hover:text-[#0d9488] transition-colors">
              <Globe2 className="w-3.5 h-3.5" /> {s.websiteBtn}
            </a>
          )}
        </div>
      </div>
      {!calculatorUrl && (
        <p className="mt-2 text-[10px] text-[#94a3b8]">⚠️ {s.noCalculator}</p>
      )}
    </div>
  );
}

const PAGE_SIZE = 20;

export default function UniversityGuide() {
  const { lang } = useI18n();
  const s = STR[lang] || STR.en;
  const stateMap = Object.fromEntries(US_STATES.map((st) => [st.code, st]));

  const [query, setQuery] = useState("");
  const [state, setState] = useState("CA");
  const [results, setResults] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const doSearch = useCallback(async (q, st) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setVisibleCount(PAGE_SIZE);

    const params = new URLSearchParams();
    params.append("api_key", API_KEY);
    params.append("fields", FIELDS);
    params.append("per_page", "25");
    if (q.trim()) params.append("school.name", q.trim());
    if (st) params.append("school.state", st);

    try {
      const res = await fetch(`${BASE_URL}?${params.toString()}`, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.metadata?.total || 0);
    } catch (e) {
      setError(e.message || "fetch error");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch("", "CA"); }, [doSearch]);

  const onSubmit = () => doSearch(query, state);
  const count = results?.length || 0;
  const visibleResults = results ? results.slice(0, visibleCount) : [];

  return (
    <div className="w-full" dir={lang === "ar" ? "rtl" : "ltr"}>
      <p className="text-center text-[13px] text-[#6B7280] dark:text-[#A8A6C4] mb-5 leading-relaxed pb-3 border-b border-[#E9D5FF] dark:border-[#4B3F8A]">
        <strong className="text-[#6D28D9]">{s.subtitle}</strong>
        <br />
        <span className="text-[11px] opacity-70">{s.subtitleHint}</span>
      </p>

      <div className="rounded-2xl bg-white/60 dark:bg-[#2D2A5A]/60 border border-[#FFE8A0] dark:border-[#4B3F8A] p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-[2] text-left">
            <label className="block text-[12px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">🏫 {s.nameLabel}</label>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder={s.namePlaceholder}
              className="w-full border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 text-base px-4 h-[48px] rounded-2xl focus:outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.15)] transition-all" />
          </div>
          <div className="flex-1 text-left">
            <label className="block text-[12px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">📍 {s.stateLabel}</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FEF3C7] text-base px-3 h-[48px] rounded-2xl focus:outline-none focus:border-[#0d9488] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.15)] transition-all cursor-pointer">
              <option value="">{s.allStates}</option>
              {US_STATES.map((st) => <option key={st.code} value={st.code}>{st[lang]}</option>)}
            </select>
          </div>
          <button onClick={onSubmit} disabled={loading}
            className="sm:self-end inline-flex items-center justify-center gap-2 h-[48px] px-7 rounded-2xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-4px_rgba(13,148,136,0.55)] active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-wait whitespace-nowrap">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? s.searching : s.searchBtn}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-[15px] font-bold text-[#111827] dark:text-[#FEF3C7] flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#6D28D9]" /> {s.results}
        </h3>
        <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#A8A6C4] bg-[#F1F5F9] dark:bg-[#1E1B4B] px-3 py-1 rounded-full">
          {loading ? "⏳ ..." : `${total} ${s.countSuffix}`}
        </span>
      </div>

      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-10 h-10 text-[#0d9488] animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#6B7280] dark:text-[#A8A6C4]">{s.loading}</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="text-[14px] font-semibold text-red-600 dark:text-red-400">{s.errorTitle}</p>
          <p className="text-[12px] text-[#6B7280] mt-1">{error}</p>
          <button onClick={onSubmit} className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#0d9488] text-white font-semibold text-sm hover:bg-[#0f766e] transition-colors">
            <RefreshCw className="w-4 h-4" /> {s.retryBtn}
          </button>
        </div>
      )}

      {!loading && !error && searched && count === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-[14px] font-medium text-[#374151] dark:text-[#D6D2EE]">{s.emptyTitle}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">{s.emptyHint}</p>
        </div>
      )}

      {!loading && !error && !searched && (
        <div className="text-center py-12">
          <Building2 className="w-10 h-10 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-[14px] font-medium text-[#374151] dark:text-[#D6D2EE]">{s.initialState}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">{s.initialStateHint}</p>
        </div>
      )}

      {!loading && !error && count > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {visibleResults.map((school) => <SchoolCard key={school.id} school={school} s={s} lang={lang} stateMap={stateMap} />)}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-[#E9D5FF] dark:border-[#4B3F8A] text-center text-[10px] text-[#9CA3AF] flex justify-center gap-3 flex-wrap">
        <span>⚡ {s.footerData}</span>
        <a href="https://collegescorecard.ed.gov" target="_blank" rel="noopener noreferrer" className="text-[#0d9488] font-medium hover:underline">{s.footerApi}</a>
      </div>
    </div>
  );
}