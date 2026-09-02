import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadApkToR2, formatBytes } from "@/lib/uploadApkToR2";
import {
  X, Upload, RefreshCw, Plus, Trash2, CheckCircle2, FileArchive,
  Rocket, History, AlertCircle,
} from "lucide-react";

const VersionEntity = base44.entities.AppVersion;
const AppEntity = base44.entities.AppStoreApp;

const EMPTY = {
  version_name: "",
  version_code: "1",
  minimum_android_version: "",
  release_notes: "",
};

export default function VersionPanel({ app, onClose }) {
  const { t } = useI18n();
  const [versions, setVersions] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const load = async () => {
    setVersions(null);
    try {
      setVersions(await VersionEntity.filter({ app_id: app.id }, "-created_date", 100));
    } catch {
      setVersions([]);
    }
  };
  useEffect(() => { load(); }, [app.id]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const upload = async () => {
    if (!file) { setError(t("اختر ملف APK أولاً")); return; }
    if (!form.version_name.trim()) { setError(t("أدخل اسم الإصدار")); return; }
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const { publicUrl } = await uploadApkToR2(file, (p) => setProgress(p));
      await VersionEntity.create({
        app_id: app.id,
        version_name: form.version_name.trim(),
        version_code: Number(form.version_code) || 1,
        apk_url: publicUrl,
        apk_filename: file.name,
        apk_size: file.size,
        minimum_android_version: form.minimum_android_version || "",
        release_notes: form.release_notes || "",
        status: "draft",
      });
      setForm(EMPTY);
      setFile(null);
      setProgress(null);
      load();
    } catch (err) {
      setError(err?.message || t("فشل الرفع"));
      setProgress(null);
    }
    setBusy(false);
  };

  const publish = async (v) => {
    setPublishingId(v.id);
    try {
      // Unpublish other versions of this app
      await VersionEntity.updateMany({ app_id: app.id, status: "published" }, { $set: { status: "draft" } });
      // Publish this version
      await VersionEntity.update(v.id, { status: "published" });
      // Point app to this version
      await AppEntity.update(app.id, { current_version_id: v.id, status: "published" });
      load();
    } catch (err) {
      setError(err?.message || t("فشل النشر"));
    }
    setPublishingId(null);
  };

  const remove = async (v) => {
    if (!confirm(`${t("حذف الإصدار")} ${v.version_name}?`)) return;
    try {
      await VersionEntity.delete(v.id);
      if (app.current_version_id === v.id) {
        await AppEntity.update(app.id, { current_version_id: "" });
      }
      load();
    } catch { /* ignore */ }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 backdrop-blur px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold text-foreground">{t("إصدارات")} — {app.name}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Upload new version */}
          <div className="rounded-2xl bg-muted/40 border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> {t("رفع إصدار جديد")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-xs font-semibold">{t("اسم الإصدار")} *</Label>
                <Input value={form.version_name} onChange={set("version_name")} placeholder="1.0.0" className="h-9" />
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold">{t("رمز الإصدار")}</Label>
                <Input type="number" value={form.version_code} onChange={set("version_code")} placeholder="1" className="h-9" />
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold">{t("أقل أندرويد")}</Label>
                <Input value={form.minimum_android_version} onChange={set("minimum_android_version")} placeholder="Android 7.0" className="h-9" />
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold">{t("ملف APK")} *</Label>
                <Input type="file" accept=".apk,application/vnd.android.package-archive" onChange={onPickFile} className="h-9 text-xs p-1" />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-xs font-semibold">{t("ملاحظات الإصدار")}</Label>
                <textarea
                  value={form.release_notes}
                  onChange={set("release_notes")}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  placeholder={t("ما الجديد...")}
                />
              </div>
            </div>

            {file && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <FileArchive className="w-3.5 h-3.5" /> {file.name} · {formatBytes(file.size)}
              </div>
            )}

            {progress !== null && (
              <div className="mt-3">
                <div className="h-2 rounded-full bg-primary/15 overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-primary font-medium">{t("جارٍ الرفع إلى التخزين")} {Math.round(progress)}%</p>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive leading-relaxed break-words">{error}</p>
              </div>
            )}

            <Button onClick={upload} disabled={busy} className="mt-3 w-full rounded-xl">
              {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {t("رفع الإصدار")}
            </Button>
          </div>

          {/* Versions list */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">{t("الإصدارات")}</h3>
            {versions === null ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/50" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t("لا توجد إصدارات بعد")}</p>
            ) : (
              <div className="space-y-2">
                {versions.map((v) => {
                  const isCurrent = app.current_version_id === v.id && v.status === "published";
                  return (
                    <div key={v.id} className={`rounded-2xl border p-3 ${isCurrent ? "border-emerald-400/60 bg-emerald-400/5" : "border-border bg-muted/30"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{v.version_name}</span>
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> {t("منشور")}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{t("مسودة")}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {v.apk_filename} · {formatBytes(v.apk_size)}
                          </p>
                          {v.release_notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.release_notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {!isCurrent && (
                            <Button
                              size="sm"
                              onClick={() => publish(v)}
                              disabled={publishingId === v.id}
                              className="h-7 rounded-lg text-xs"
                            >
                              {publishingId === v.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />}
                              {t("نشر")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => remove(v)}
                            className="h-7 rounded-lg text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}