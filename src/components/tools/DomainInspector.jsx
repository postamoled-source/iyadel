import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  Search, Loader2, Globe, Server, MapPin, Building2, Network,
  ShieldCheck, AlertTriangle, FileClock, User, Database,
} from "lucide-react";

// ============================================================
// DomainInspectorEngine — فحص النطاقات والخوادم
// RDAP (بديل WHOIS الرسمي) + DNS عبر HTTPS + موقع الاستضافة
// + فحص الحالة + ترجمة فورية اختيارية.
// يعمل بالكامل داخل المتصفح — لا تُرسل أي بيانات لخوادم iyadel.
// ============================================================
class DomainInspectorEngine {
  // 1. التحقق من صحة النطاق
  static validateDomain(input) {
    const domain = String(input || "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/^www\./, "");
    const regex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return regex.test(domain) ? domain : false;
  }

  // 2. الفحص الرئيسي — كل الفحوصات بالتوازي
  static async inspect(domain, lang = "en") {
    const cleanDomain = this.validateDomain(domain);
    if (!cleanDomain) {
      return { status: "error", message: "invalid_domain" };
    }

    const [rdap, dns, location, status] = await Promise.all([
      this.getRdap(cleanDomain),
      this.getDnsRecords(cleanDomain),
      this.getLocation(cleanDomain),
      this.checkStatus(cleanDomain),
    ]);

    const result = {
      status: "success",
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      summary: {
        domain_name: cleanDomain,
        server_ip: location.ip || "—",
        country: location.country || "—",
        city: location.city || "—",
        isp: location.isp || "—",
        site_availability: status ? "🟢 Active (Working)" : "🔴 Inactive or Not Responding",
      },
      details: {
        rdap_info: rdap,
        dns_records: dns,
        hosting_location: location,
        online_check: status,
      },
    };

    if (lang && lang !== "en") {
      return await this.translateResult(result, lang);
    }
    return result;
  }

  // 3. بيانات RDAP (بديل WHOIS الرسمي)
  static async getRdap(domain) {
    try {
      const response = await fetch(`https://rdap.org/domain/${domain}`);
      if (!response.ok) throw new Error("RDAP unavailable");
      const data = await response.json();

      const nameservers = data.nameservers?.map((ns) => ns.ldhName).join(", ") || "—";
      const events = data.events || [];
      const creation = events.find((e) => e.eventAction === "registration")?.eventDate || "";
      const expiry = events.find((e) => e.eventAction === "expiration")?.eventDate || "";
      const registrant =
        data.entities?.find((e) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.[1]?.[3] || "";

      return {
        registrar: data.registrar?.name || "—",
        creation_date: creation ? creation.split("T")[0] : "—",
        expiration_date: expiry ? expiry.split("T")[0] : "—",
        nameservers,
        registrant: registrant || "—",
      };
    } catch {
      return { registrar: "—", creation_date: "—", expiration_date: "—", nameservers: "—", registrant: "—" };
    }
  }

  // 4. سجلات DNS عبر Cloudflare (DoH)
  static async getDnsRecords(domain) {
    const query = async (type) => {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`, {
        headers: { Accept: "application/dns-json" },
      });
      return res.json();
    };
    try {
      const [dataA, dataMx, dataNs] = await Promise.all([query("A"), query("MX"), query("NS")]);
      const ips = dataA.Answer?.filter((a) => a.type === 1).map((a) => a.data) || [];
      const mx = dataMx.Answer?.filter((a) => a.type === 15).map((a) => a.data) || [];
      const ns = dataNs.Answer?.filter((a) => a.type === 2).map((a) => a.data) || [];

      return {
        a_records: ips.length > 0 ? ips : ["No A records"],
        mx_records: mx.length > 0 ? mx : ["No MX records"],
        ns_records: ns.length > 0 ? ns : ["No NS records"],
      };
    } catch {
      return { a_records: [], mx_records: [], ns_records: [] };
    }
  }

  // 5. موقع الاستضافة (IP - الدولة - المدينة - المزود)
  // ipwho.is: مجاني ويدعم HTTPS وCORS (ip-api.com المجاني يدعم HTTP فقط)
  static async getLocation(domain) {
    try {
      const response = await fetch(`https://ipwho.is/${domain}`);
      if (!response.ok) throw new Error("Location unavailable");
      const data = await response.json();
      if (!data || data.success === false) {
        return { ip: "—", country: "—", city: "—", isp: "—" };
      }
      return {
        ip: data.ip || "—",
        country: data.country || "—",
        city: data.city || "—",
        isp: data.connection?.isp || "—",
      };
    } catch {
      return { ip: "—", country: "—", city: "—", isp: "—" };
    }
  }

  // 6. فحص حالة الموقع (نشط أم لا)
  static async checkStatus(domain) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(`https://${domain}`, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      });
      clearTimeout(timeout);
      return true;
    } catch {
      return false;
    }
  }

  // 7. الترجمة الفورية
  static async translateText(text, targetLang) {
    if (!text || typeof text !== "string" || text.length === 0) return text;
    if (targetLang === "en") return text;
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Translation unavailable");
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) return data[0][0][0];
      return text;
    } catch {
      return text;
    }
  }

  static async translateObject(obj, lang) {
    if (typeof obj === "string") {
      return await this.translateText(obj, lang);
    }
    if (Array.isArray(obj)) {
      return await Promise.all(obj.map((item) => this.translateObject(item, lang)));
    }
    if (obj && typeof obj === "object") {
      const translated = {};
      await Promise.all(
        Object.entries(obj).map(async ([key, value]) => {
          if (
            typeof value === "string" &&
            !this.isDateString(value) &&
            !this.isIpAddress(value) &&
            key !== "domain" &&
            key !== "domain_name" &&
            key !== "server_ip" &&
            key !== "creation_date" &&
            key !== "expiration_date" &&
            key !== "timestamp"
          ) {
            translated[key] = await this.translateText(value, lang);
          } else if (typeof value === "object" && value !== null) {
            translated[key] = await this.translateObject(value, lang);
          } else {
            translated[key] = value;
          }
        })
      );
      return translated;
    }
    return obj;
  }

  static isDateString(str) {
    return /^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{2}\/\d{2}\/\d{4}/.test(str);
  }

  static isIpAddress(str) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str);
  }

  static async translateResult(result, lang) {
    const translated = { ...result };
    if (translated.summary) {
      translated.summary = await this.translateObject(translated.summary, lang);
    }
    if (translated.details?.rdap_info) {
      translated.details.rdap_info = await this.translateObject(translated.details.rdap_info, lang);
    }
    if (translated.details?.hosting_location) {
      translated.details.hosting_location = await this.translateObject(translated.details.hosting_location, lang);
    }
    if (translated.message) {
      translated.message = await this.translateText(translated.message, lang);
    }
    return translated;
  }
}

// ---------- UI atoms ----------
function InfoChip({ icon: Icon, label, value, good }) {
  const tone =
    good === true
      ? "text-emerald-600 dark:text-emerald-400"
      : good === false
        ? "text-red-500 dark:text-red-400"
        : "text-[#111827] dark:text-[#FEF3C7]";
  return (
    <div className="min-w-0 rounded-2xl bg-background border border-border px-4 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
      </div>
      <div className={`text-sm font-bold break-all ${tone}`}>{value || "—"}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <Icon className="w-4 h-4 text-primary" /> {label}
      </dt>
      <dd className="text-sm font-bold text-foreground text-end break-all">{value || "—"}</dd>
    </div>
  );
}

function RecordChips({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-muted-foreground">—</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((v, i) => (
        <code key={i} dir="ltr" className="text-xs font-mono bg-secondary border border-border rounded-lg px-2.5 py-1 text-foreground break-all">
          {v}
        </code>
      ))}
    </div>
  );
}

// ---------- Section ----------
export default function DomainInspector() {
  const { t, lang } = useI18n();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const clean = DomainInspectorEngine.validateDomain(domain);
    if (!clean) {
      setResult(null);
      setError(t("Please enter a valid domain like example.com"));
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    trackEvent("domain_inspector_run");
    try {
      const res = await DomainInspectorEngine.inspect(clean, lang);
      if (res && res.status === "success") {
        setResult(res);
      } else {
        setError((res && res.message) || t("Something went wrong while checking. Please try again."));
      }
    } catch {
      setError(t("Something went wrong while checking. Please try again."));
    }
    setLoading(false);
  };

  const s = result?.summary;
  const rdap = result?.details?.rdap_info || {};
  const dns = result?.details?.dns_records || {};
  const online = result?.details?.online_check;

  return (
    <section id="domain-inspector" className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-[3rem] bg-card border border-border p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">{t("Domain & Server Inspector")}</h2>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-2xl">
              {t("Check any domain or server: DNS records, hosting location, registration info and live status — all in one scan.")}
            </p>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={domain}
                  onChange={(e) => { setDomain(e.target.value); setError(""); }}
                  placeholder={t("Enter a domain, e.g. google.com")}
                  className="w-full min-h-[48px] h-14 rounded-2xl border border-input bg-background text-foreground ps-12 pe-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-base"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-14 rounded-2xl px-8 font-bold text-base">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? t("Checking...") : t("Inspect")}
              </Button>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {loading && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
            )}

            {result && !loading && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-primary" dir="ltr">{result.domain}</span>
                  <span className="text-xs text-muted-foreground">{result.timestamp?.split("T")[0]}</span>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoChip icon={Server} label={t("Server IP")} value={s.server_ip} />
                  <InfoChip icon={MapPin} label={t("Country")} value={s.country} />
                  <InfoChip icon={Building2} label={t("City")} value={s.city} />
                  <InfoChip icon={Network} label={t("Provider (ISP)")} value={s.isp} />
                  <InfoChip icon={ShieldCheck} label={t("Status")} value={s.site_availability} good={online === true ? true : online === false ? false : undefined} />
                </div>

                {/* Registration (RDAP) */}
                <div className="rounded-2xl border border-border bg-background p-5">
                  <h3 className="font-bold text-card-foreground mb-3 flex items-center gap-2">
                    <FileClock className="w-4 h-4 text-primary" /> {t("Registration Info (RDAP)")}
                  </h3>
                  <dl>
                    <InfoRow icon={Building2} label={t("Registrar")} value={rdap.registrar} />
                    <InfoRow icon={FileClock} label={t("Created")} value={rdap.creation_date} />
                    <InfoRow icon={FileClock} label={t("Expires")} value={rdap.expiration_date} />
                    <InfoRow icon={Network} label={t("Nameservers")} value={rdap.nameservers} />
                    <InfoRow icon={User} label={t("Owner")} value={rdap.registrant} />
                  </dl>
                </div>

                {/* DNS records */}
                <div className="rounded-2xl border border-border bg-background p-5">
                  <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" /> {t("DNS Records")}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{t("A Records (IP addresses)")}</p>
                      <RecordChips items={dns.a_records} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{t("MX Records (mail servers)")}</p>
                      <RecordChips items={dns.mx_records} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{t("NS Records (name servers)")}</p>
                      <RecordChips items={dns.ns_records} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}