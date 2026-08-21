import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import { ArrowLeft, TrendingUp, MousePointerClick, Layers, Calendar, Trophy, RefreshCw, BarChart3, FileText, ShieldCheck, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/analytics";
import { CATEGORIES } from "@/data/tools";
import BlogManager from "@/components/admin/BlogManager";

const ToolUsageEntity = base44.entities.ToolUsage;

const CAT_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#22c55e", "#3b82f6", "#f97316", "#ec4899", "#14b8a6"];

function StatCard({ icon: Icon, label, value, color = "primary" }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}/10`}>
          <Icon className={`w-5 h-5 text-${color === "accent" ? "accent" : "primary"}`} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-foreground">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useState("analytics");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useSeo({ title: "Admin Dashboard", description: "iyadel admin dashboard.", path: "/Dashboard", noindex: true });

  const isAdmin = user && user.role === "admin";

  const load = async () => {
    setLoading(true);
    try {
      const all = await ToolUsageEntity.list("-created_date", 500);
      setRecords(all || []);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    if (!records.length) return { top: [], daily: [], byCat: [], total: 0, uniqueTools: 0, today: 0 };

    const counts = {};
    const catCounts = {};
    records.forEach((r) => {
      const key = r.slug || r.tool_name;
      counts[key] = counts[key] || { slug: key, name: r.tool_name || key, category: r.category, count: 0 };
      counts[key].count += 1;
      if (r.category) catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    const top = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8);

    const byCat = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const days = [];
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today0);
      d.setDate(d.getDate() - i);
      days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: 0 });
    }
    const dayMap = {};
    days.forEach((d) => { dayMap[d.key] = d; });
    records.forEach((r) => {
      const key = (r.created_date || "").slice(0, 10);
      if (dayMap[key]) dayMap[key].count += 1;
    });
    const daily = days;

    const todayKey = today0.toISOString().slice(0, 10);
    const today = records.filter((r) => (r.created_date || "").slice(0, 10) === todayKey).length;

    return { top, daily, byCat, total: records.length, uniqueTools: Object.keys(counts).length, today };
  }, [records]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full rounded-[2rem] bg-card border border-border p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Admin Access Only</h1>
          <p className="text-muted-foreground mb-8">You must be logged in as an admin to manage this section.</p>
          <Link to="/login">
            <Button className="w-full h-12 rounded-xl font-semibold">
              <LogIn className="w-4 h-4 mr-2" /> Log in as Admin
            </Button>
          </Link>
          <Link to="/" className="block mt-4 text-sm text-muted-foreground hover:text-primary transition-colors">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="relative bg-secondary pt-12 pb-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-all mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("Back")}
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">{t("Admin Dashboard")}</h1>
            <p className="text-muted-foreground">{t("Manage your blog posts and view usage analytics.")}</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8">
            <button onClick={() => setTab("analytics")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab === "analytics" ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" : "bg-card text-card-foreground border border-border hover:bg-muted"}`}>
              <BarChart3 className="w-4 h-4" /> {t("Analytics")}
            </button>
            <button onClick={() => setTab("posts")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab === "posts" ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" : "bg-card text-card-foreground border border-border hover:bg-muted"}`}>
              <FileText className="w-4 h-4" /> {t("Blog Posts")}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-6 relative z-10">
        {tab === "posts" ? (
          <BlogManager />
        ) : loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon={MousePointerClick} label={t("Total Uses")} value={stats.total} color="primary" />
              <StatCard icon={TrendingUp} label={t("Today")} value={stats.today} color="accent" />
              <StatCard icon={Layers} label={t("Unique Tools")} value={stats.uniqueTools} color="primary" />
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex items-center">
                <Button onClick={load} variant="outline" className="w-full rounded-xl h-11">
                  <RefreshCw className="w-4 h-4 mr-2" /> {t("Refresh")}
                </Button>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="rounded-[2rem] bg-card border border-border p-12 text-center shadow-sm">
                <MousePointerClick className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-card-foreground text-lg font-medium">{t("No usage data yet")}</p>
                <p className="text-muted-foreground mt-2">{t("Usage is recorded automatically when visitors open tools.")}</p>
              </div>
            ) : (
              <>
                <div className="rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-sm mb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Trophy className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-bold text-foreground">{t("Most Used Tools")}</h2>
                  </div>
                  <div className="space-y-3">
                    {stats.top.map((tool, i) => {
                      const max = stats.top[0].count;
                      const pct = Math.round((tool.count / max) * 100);
                      return (
                        <div key={tool.slug} className="flex items-center gap-3">
                          <span className="shrink-0 w-6 text-sm font-bold text-muted-foreground">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-foreground truncate">{tool.name}</span>
                              <span className="text-xs font-medium text-muted-foreground ml-2 shrink-0">{tool.count}</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-sm mb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">{t("Daily Usage (14 days)")}</h2>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.daily}>
                        <defs>
                          <linearGradient id="dailyUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                        <Area type="monotone" dataKey="count" name={t("Uses")} stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#dailyUsage)" isAnimationActive animationDuration={1000} animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold text-foreground">{t("Top Tools Chart")}</h2>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.top} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} allowDecimals={false} />
                          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={90} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                          <Bar dataKey="count" name={t("Uses")} radius={[0, 8, 8, 0]} barSize={18} isAnimationActive animationDuration={900} animationEasing="ease-out">
                            {stats.top.map((_, i) => (
                              <Cell key={i} fill={i === 0 ? "hsl(var(--accent))" : "hsl(var(--primary))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Layers className="w-5 h-5 text-accent" />
                      <h2 className="text-xl font-bold text-foreground">{t("Usage by Category")}</h2>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.byCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} isAnimationActive animationDuration={900} animationEasing="ease-out">
                            {stats.byCat.map((_, i) => (
                              <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}