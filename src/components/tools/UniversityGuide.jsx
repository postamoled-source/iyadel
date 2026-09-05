import { useState, useEffect, useCallback, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { getCountryData } from "@/data/university-data";
import {
  Search, ExternalLink, AlertCircle, Building2, Mail, Globe2, RefreshCw,
  GraduationCap, FileText, DollarSign, CalendarClock, Stethoscope, Banknote,
} from "lucide-react";

const TARGET_COUNTRIES = [
  "United States", "Canada", "Russia", "China", "Japan", "South Korea",
  "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus",
  "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy",
  "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein", "Lithuania",
  "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands",
  "North Macedonia", "Norway", "Poland", "Portugal", "Romania",
  "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
  "Switzerland", "Ukraine", "United Kingdom", "Vatican City",
].sort((a, b) => a.localeCompare(b));

const STR = {
  en: {
    subtitle: "Search universities in the US, Canada, Europe, China, Japan, South Korea & Russia — with tuition costs & required documents",
    subtitleHint: "Accurate university info with direct links, admission requirements & fees",
    nameLabel: "University Name",
    namePlaceholder: "e.g. Harvard, Oxford, Toronto, Tsinghua, Tokyo...",
    countryLabel: "Country",
    allCountries: "All Selected Countries",
    searchBtn: "Search",
    searching: "Searching...",
    results: "Results",
    countSuffix: "universities",
    loading: "Searching for universities...",
    errorTitle: "An error occurred during search",
    errorRetry: "Please try again",
    retryBtn: "Retry",
    emptyTitle: "No universities found matching your search",
    emptyHint: "Try changing the university name or country",
    initialState: "Search for a university to start",
    initialStateHint: "Enter a university name or select a country",
    domainLabel: "Primary Domain",
    stateLabel: "State / Province",
    domainsCountLabel: "Domains Count",
    domainsListLabel: "Domains",
    noDomains: "None",
    visitBtn: "Visit Official Website",
    noWebsite: "No website link available",
    footerData: "Data provided by",
    footerApi: "Hipolabs Universities API",
    footerCoverage: "Covers selected countries",
    footerUpdated: "Data is continuously updated",
    tuitionIntl: "Tuition (International)",
    tuitionDom: "Tuition (Domestic)",
    livingCost: "Living Cost",
    currency: "Currency",
    documentsTitle: "Required Documents",
    applicationPortal: "Application Portal",
    visaInfo: "Visa Info",
    academicYear: "Academic Year",
    deadline: "Application Deadline",
    showMore: "Show more documents",
    showLess: "Show less",
    countryInfo: "Country Admission Info",
    loadMore: "Load more",
    showing: "showing",
    of: "of",
  },
  ar: {
    subtitle: "ابحث في جامعات أمريكا، كندا، أوروبا، الصين، اليابان، كوريا الجنوبية وروسيا — مع التكاليف والوثائق المطلوبة",
    subtitleHint: "معلومات دقيقة عن الجامعات مع روابط مباشرة وشروط القبول والرسوم",
    nameLabel: "اسم الجامعة",
    namePlaceholder: "مثال: Harvard, Oxford, Toronto, Tsinghua, Tokyo...",
    countryLabel: "الدولة",
    allCountries: "جميع الدول المختارة",
    searchBtn: "بحث",
    searching: "جاري البحث...",
    results: "النتائج",
    countSuffix: "جامعة",
    loading: "جاري البحث عن الجامعات...",
    errorTitle: "حدث خطأ أثناء البحث",
    errorRetry: "يرجى المحاولة مرة أخرى",
    retryBtn: "إعادة المحاولة",
    emptyTitle: "لم يتم العثور على جامعات تطابق بحثك",
    emptyHint: "حاول تغيير اسم الجامعة أو الدولة",
    initialState: "ابحث عن جامعة لبدء العرض",
    initialStateHint: "أدخل اسم الجامعة أو اختر دولة",
    domainLabel: "النطاق الأساسي",
    stateLabel: "المقاطعة / الولاية",
    domainsCountLabel: "عدد النطاقات",
    domainsListLabel: "النطاقات",
    noDomains: "لا يوجد",
    visitBtn: "زيارة الموقع الرسمي",
    noWebsite: "لا يوجد رابط للموقع",
    footerData: "البيانات مقدمة من",
    footerApi: "Hipolabs Universities API",
    footerCoverage: "تغطي الدول المختارة",
    footerUpdated: "يتم تحديث البيانات بشكل مستمر",
    tuitionIntl: "الرسوم (أجانب)",
    tuitionDom: "الرسوم (محليين)",
    livingCost: "تكاليف المعيشة",
    currency: "العملة",
    documentsTitle: "الوثائق المطلوبة",
    applicationPortal: "بوابة التقديم",
    visaInfo: "معلومات التأشيرة",
    academicYear: "السنة الدراسية",
    deadline: "آخر موعد للتقديم",
    showMore: "عرض المزيد من الوثائق",
    showLess: "عرض أقل",
    countryInfo: "معلومات القبول للدولة",
    loadMore: "عرض المزيد",
    showing: "عرض",
    of: "من",
  },
};

function InfoRow({ icon: Icon, label, value, lang }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-[#6D28D9] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-[#8B8AB0] uppercase tracking-wide block">{label}</span>
        <span className="text-[12px] font-medium text-[#1E1B4B] dark:text-[#FEF3C7] break-words">{value}</span>
      </div>
    </div>
  );
}

function UniversityCard({ school, s, lang }) {
  const name = school.name || (lang === "ar" ? "اسم غير معروف" : "Unknown");
  const country = school.country || (lang === "ar" ? "دولة غير معروفة" : "Unknown");
  const stateProvince = school["state-province"] || "";
  const domains = school.domains || [];
  const webPages = school.web_pages || [];
  const mainDomain = domains[0] || "";
  const mainWebPage = webPages[0] || "";
  const location = [country, stateProvince].filter(Boolean).join(lang === "ar" ? "، " : ", ");
  const cData = useMemo(() => getCountryData(country), [country]);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const flag = cData.flag || "🌍";
  const visibleDocs = docsExpanded ? cData.documents : cData.documents.slice(0, 4);

  return (
    <div className="rounded-2xl bg-[#FFFEF5] dark:bg-[#2D2A5A] border border-[#FFE8A0] dark:border-[#4B3F8A] p-5 transition-all duration-200 hover:border-[#F59E0B] hover:shadow-[0_8px_30px_rgba(109,40,217,0.08)]">
      {/* Header */}
      <div className="flex items-start gap-2 mb-1">
        <GraduationCap className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
        <h4 className="text-[17px] font-bold text-[#1E1B4B] dark:text-[#FEF3C7] leading-tight flex-1">{name}</h4>
      </div>
      <p className="text-[13px] text-[#6B7280] dark:text-[#A8A6C4] mb-3 flex items-center gap-1.5 ml-7">
        <span className="text-base">{flag}</span>
        {location || (lang === "ar" ? "📍 معلومات الموقع غير متوفرة" : "📍 Location unavailable")}
      </p>

      {/* Domain info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-[#8B8AB0] uppercase tracking-wide">{s.domainLabel}</span>
          {mainDomain ? (
            <a href={`https://${mainDomain}`} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-[#6D28D9] hover:underline break-all">{mainDomain}</a>
          ) : <span className="text-[13px] text-[#9CA3AF]">—</span>}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-[#8B8AB0] uppercase tracking-wide">{s.domainsCountLabel}</span>
          <span className="text-[13px] font-medium text-[#1E1B4B] dark:text-[#FEF3C7]">{domains.length || 0}</span>
        </div>
      </div>

      {/* Costs section */}
      <div className="rounded-xl bg-[#FFFBEB] dark:bg-[#1E1B4B] border border-[#FDE68A] dark:border-[#4B3F8A] p-3 mb-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <DollarSign className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-[11px] font-bold text-[#92400E] dark:text-[#FBBF24] uppercase tracking-wide">{s.countryInfo}: {flag} {country}</span>
        </div>
        <InfoRow icon={Banknote} label={s.tuitionIntl} value={cData.tuition_international} lang={lang} />
        <InfoRow icon={Banknote} label={s.tuitionDom} value={cData.tuition_domestic} lang={lang} />
        <InfoRow icon={Stethoscope} label={s.livingCost} value={cData.living_cost} lang={lang} />
        <InfoRow icon={DollarSign} label={s.currency} value={cData.currency} lang={lang} />
        <InfoRow icon={CalendarClock} label={s.academicYear} value={cData.academic_year} lang={lang} />
        <InfoRow icon={CalendarClock} label={s.deadline} value={cData.deadline} lang={lang} />
      </div>

      {/* Documents section */}
      <div className="rounded-xl bg-white dark:bg-[#1E1B4B] border border-[#E9D5FF] dark:border-[#4B3F8A] p-3 mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <FileText className="w-3.5 h-3.5 text-[#6D28D9]" />
          <span className="text-[11px] font-bold text-[#6D28D9] uppercase tracking-wide">{s.documentsTitle}</span>
        </div>
        <ul className="space-y-1.5">
          {visibleDocs.map((doc, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[12px] text-[#374151] dark:text-[#D6D2EE]">
              <span className="text-[#F59E0B] mt-0.5 shrink-0">▸</span>
              <span className="break-words">{doc}</span>
            </li>
          ))}
        </ul>
        {cData.documents.length > 4 && (
          <button onClick={() => setDocsExpanded(!docsExpanded)} className="mt-2 text-[11px] font-semibold text-[#6D28D9] hover:underline">
            {docsExpanded ? `▲ ${s.showLess}` : `▼ ${s.showMore} (${cData.documents.length})`}
          </button>
        )}
      </div>

      {/* Portal & Visa links */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {cData.portal && (
          <a href={cData.portal} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6D28D9] hover:underline break-all">
            <Globe2 className="w-3.5 h-3.5 shrink-0" /> {s.applicationPortal}: {cData.portal.replace(/^https?:\/\//, "")}
          </a>
        )}
        {cData.visa_link && (
          <a href={cData.visa_link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6D28D9] hover:underline break-all">
            <FileText className="w-3.5 h-3.5 shrink-0" /> {s.visaInfo}: {cData.visa}
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-dashed border-[#E9D5FF] dark:border-[#4B3F8A] flex flex-wrap items-center justify-between gap-2">
        {mainWebPage ? (
          <a href={mainWebPage} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#6D28D9] text-white text-[12px] font-semibold hover:bg-[#5B21B6] transition-colors">
            <Globe2 className="w-3.5 h-3.5" /> {s.visitBtn}
          </a>
        ) : (
          <span className="text-[11px] text-[#9CA3AF]">{s.noWebsite}</span>
        )}
        {mainDomain && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#6B7280] dark:text-[#A8A6C4] bg-[#F1F5F9] dark:bg-[#1E1B4B] px-3 py-1 rounded-full border border-[#E5E7EB] dark:border-[#4B3F8A]">
            <Mail className="w-3 h-3" /> {mainDomain}
          </span>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function UniversityGuide() {
  const { lang } = useI18n();
  const s = STR[lang] || STR.en;
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("Canada");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const doSearch = useCallback(async (q, c) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setVisibleCount(PAGE_SIZE);

    const nameParam = q.trim();
    // Build a single API URL — one request only, no batch fetching
    const params = new URLSearchParams();
    if (nameParam) params.append("name", nameParam);
    if (c) params.append("country", c);

    const tryFetch = async (signal) => {
      const url = `https://universities.hipolabs.com/search?${params.toString()}`;
      const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      let data = await tryFetch(controller.signal);
      // When no specific country selected, filter to only our target countries
      if (!c) {
        data = data.filter((u) => TARGET_COUNTRIES.includes(u.country));
      }
      setResults(data);
    } catch (e) {
      // Retry once without timeout abort — the API can be slow on first hit
      try {
        let data = await tryFetch(AbortSignal.timeout(12000));
        if (!c) data = data.filter((u) => TARGET_COUNTRIES.includes(u.country));
        setResults(data);
        setError(null);
      } catch (e2) {
        setError(e2.name === "TimeoutError" ? "Request timed out — please try again" : (e2.message || "fetch error"));
        setResults([]);
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch("", "Canada"); }, [doSearch]);

  const onSubmit = () => doSearch(query, country);
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
          <div className="flex-1 text-left">
            <label className="block text-[12px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">🏫 {s.nameLabel}</label>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder={s.namePlaceholder}
              className="w-full border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 text-base px-4 h-[48px] rounded-2xl focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)] transition-all" />
          </div>
          <div className="sm:w-[180px] text-left">
            <label className="block text-[12px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">📍 {s.countryLabel}</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)}
              className="w-full border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FEF3C7] text-base px-3 h-[48px] rounded-2xl focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)] transition-all cursor-pointer">
              <option value="">{s.allCountries}</option>
              {TARGET_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={onSubmit} disabled={loading}
            className="sm:self-end inline-flex items-center justify-center gap-2 h-[48px] px-7 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-bold text-sm border-2 border-[#F59E0B] shadow-[0_8px_20px_-4px_rgba(109,40,217,0.4)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-4px_rgba(109,40,217,0.55)] active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-wait whitespace-nowrap">
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
          {loading ? "⏳ ..." : `${count} ${s.countSuffix}`}
        </span>
      </div>

      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-10 h-10 text-[#6D28D9] animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#6B7280] dark:text-[#A8A6C4]">{s.loading}</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="text-[14px] font-semibold text-red-600 dark:text-red-400">{s.errorTitle}</p>
          <p className="text-[12px] text-[#6B7280] mt-1">{error}</p>
          <button onClick={onSubmit} className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#6D28D9] text-white font-semibold text-sm hover:bg-[#5B21B6] transition-colors">
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
        <>
          <div className="grid grid-cols-1 gap-3">
            {visibleResults.map((school, i) => <UniversityCard key={i} school={school} s={s} lang={lang} />)}
          </div>
          {visibleCount < count && (
            <div className="text-center mt-4">
              <button onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] text-[#1E1B4B] dark:text-[#FEF3C7] font-semibold text-sm hover:border-[#F59E0B] transition-colors">
                {s.loadMore} ({s.showing} {visibleCount} {s.of} {count})
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6 pt-4 border-t border-[#E9D5FF] dark:border-[#4B3F8A] text-center text-[10px] text-[#9CA3AF] flex justify-center gap-3 flex-wrap">
        <span>⚡ {s.footerData}</span>
        <a href="https://github.com/Hipo/university-domains-list" target="_blank" rel="noopener noreferrer" className="text-[#6D28D9] font-medium hover:underline">{s.footerApi}</a>
        <span>•</span>
        <span>🌍 {s.footerCoverage}</span>
        <span>•</span>
        <span>📅 {s.footerUpdated}</span>
      </div>
    </div>
  );
}