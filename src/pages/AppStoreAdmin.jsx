import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Image as Img } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VersionPanel from "@/components/appstore/VersionPanel";
import {
  Package, ArrowLeft, Plus, Trash2, Upload, Save, RefreshCw, X,
  ImageIcon, Pencil, ShieldCheck, LogIn, History, Rocket,
} from "lucide-react";

const AppEntity = base44.entities.AppStoreApp;

const EMPTY = { name: "", slug: "", description: "", category: "", icon_url: "", status: "draft", images: [] };

const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function AppStoreAdmin() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [apps, setApps] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [versionApp, setVersionApp] = useState(null);
  const [appsVersionCount, setAppsVersionCount] = useState({});

  const isAdmin = user && user.role === "admin";

  const load = async () => {
    setApps(null);
    try {
      const list = await AppEntity.list("-created_date", 200);
      setApps(list);
      // version counts per app (for display)
      try {
        const vs = await base44.entities.AppVersion.list("-created_date", 500);
        const counts = {};
        for (const v of vs) counts[v.app_id] = (counts[v.app_id] || 0) + 1;
        setAppsVersionCount(counts);
      } catch { /* ignore */ }
    } catch {
      setApps([]);
    }
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full rounded-[2rem] bg-card border border-border p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">{t("Admin Access Only")}</h1>
          <p className="text-muted-foreground mb-8">{t("You must be logged in as an admin to manage this section.")}</p>
          <Link to="/login">
            <Button className="w-full h-12 rounded-xl font-semibold">
              <LogIn className="w-4 h-4 mr-2" /> {t("Log in as Admin")}
            </Button>
          </Link>
          <Link to="/app-store" className="block mt-4 text-sm text-muted-foreground hover:text-primary transition-colors">← {t("Back to App Store")}</Link>
        </div>
      </div>
    );
  }

  const uploadFile = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const onUploadIcon = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const url = await uploadFile(file);
      setForm((p) => ({ ...p, icon_url: url }));
    } catch { /* ignore */ }
    setUploadingIcon(false);
    e.target.value = "";
  };

  const onUploadGallery = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setForm((p) => ({ ...p, images: [...(p.images || []), ...urls] }));
    } catch { /* ignore */ }
    setUploadingGallery(false);
    e.target.value = "";
  };

  const removeImage = (idx) => setForm((p) => ({ ...p, images: (p.images || []).filter((_, i) => i !== idx) }));

  const startNew = () => { setForm(EMPTY); setEditing("new"); };
  const startEdit = (app) => {
    setForm({ ...EMPTY, ...app, images: app.images || [] });
    setEditing(app.id);
  };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description || "",
        category: form.category || "",
        icon_url: form.icon_url || "",
        status: form.status || "draft",
        images: form.images || [],
      };
      if (editing === "new") {
        await AppEntity.create(payload);
      } else {
        await AppEntity.update(editing, payload);
      }
      cancelEdit();
      load();
    } catch { /* ignore */ }
    setBusy(false);
  };

  const remove = async (app) => {
    if (!confirm(`${t("Delete")} "${app.name}"?`)) return;
    try {
      // remove versions of this app
      await base44.entities.AppVersion.deleteMany({ app_id: app.id });
      await AppEntity.delete(app.id);
      load();
    } catch { /* ignore */ }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div dir="rtl" className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/app-store" className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all">
              <ArrowLeft className="w-4 h-4" /> {t("Back")}
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{t("App Store Admin")}</h1>
                <p className="text-sm text-muted-foreground">{t("Add, edit and publish apps to the store")}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={load} variant="outline" className="rounded-2xl">
              <RefreshCw className="w-4 h-4" /> {t("Refresh")}
            </Button>
            <Button onClick={startNew} className="rounded-2xl">
              <Plus className="w-4 h-4" /> {t("Add App")}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mb-8 rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editing === "new" ? t("New App") : t("Edit App")}
                </h2>
                <button onClick={cancelEdit} className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold">{t("App Name")} *</Label>
                  <Input value={form.name} onChange={set("name")} placeholder="My App" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold">{t("Category")}</Label>
                  <Input value={form.category} onChange={set("category")} placeholder="Productivity" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold">{t("Status")}</Label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="draft">{t("Draft")}</option>
                    <option value="published">{t("Published")}</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block text-sm font-semibold">{t("Description")}</Label>
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    rows={4}
                    placeholder={t("Describe this app...")}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  />
                </div>
              </div>

              {/* Icon upload */}
              <div className="mt-6">
                <Label className="mb-1.5 block text-sm font-semibold">{t("App Icon")}</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {form.icon_url ? (
                      <img src={form.icon_url} alt="icon" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input id="icon-input" type="file" accept="image/*" onChange={onUploadIcon} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("icon-input")?.click()} disabled={uploadingIcon} className="rounded-xl">
                      {uploadingIcon ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {t("Upload Icon")}
                    </Button>
                    {form.icon_url && (
                      <button onClick={() => setForm((p) => ({ ...p, icon_url: "" }))} className="block text-xs text-destructive mt-2 hover:underline">
                        {t("Remove")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div className="mt-6">
                <Label className="mb-1.5 block text-sm font-semibold">{t("App Images (Gallery)")}</Label>
                <input id="gallery-input" type="file" accept="image/*" multiple onChange={onUploadGallery} className="hidden" />
                <Button type="button" variant="outline" onClick={() => document.getElementById("gallery-input")?.click()} disabled={uploadingGallery} className="rounded-xl">
                  {uploadingGallery ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t("Add Images")}
                </Button>

                {(form.images || []).length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                        <img src={url} alt={`img-${i}`} className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center gap-3">
                <Button onClick={save} disabled={busy || !form.name.trim()} className="rounded-xl">
                  {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t("Save App")}
                </Button>
                <Button onClick={cancelEdit} variant="ghost" className="rounded-xl">{t("Cancel")}</Button>
                <p className="text-xs text-muted-foreground mr-auto">{t("APK files are uploaded from the Versions panel.")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {apps === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-3xl bg-muted/60" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="rounded-[2rem] bg-card border border-border p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-card-foreground text-lg font-medium">{t("No apps yet")}</p>
            <p className="text-muted-foreground mt-2">{t("Click \"Add App\" to publish your first app.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => {
              const published = app.status === "published" && app.current_version_id;
              return (
                <div key={app.id} className="rounded-3xl bg-card border border-border p-4 shadow-sm flex gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                    {app.icon_url ? (
                      <Img src={app.icon_url} alt={app.name} fittingType="fill" className="h-full w-full" />
                    ) : (
                      <Package className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{app.name}</h3>
                      {published ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Rocket className="w-3 h-3" /> {t("Live")}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{t("Draft")}</span>
                      )}
                    </div>
                    {app.category && <span className="text-xs text-primary font-medium">{app.category}</span>}
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{app.description || "—"}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><History className="w-3 h-3" /> {appsVersionCount[app.id] || 0} {t("versions")}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Button onClick={() => setVersionApp(app)} variant="default" size="sm" className="rounded-lg h-8">
                        <History className="w-3.5 h-3.5" /> {t("Versions")}
                      </Button>
                      <Button onClick={() => startEdit(app)} variant="outline" size="sm" className="rounded-lg h-8">
                        <Pencil className="w-3.5 h-3.5" /> {t("Edit")}
                      </Button>
                      <Button onClick={() => remove(app)} variant="ghost" size="sm" className="rounded-lg h-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {versionApp && <VersionPanel app={versionApp} onClose={() => { setVersionApp(null); load(); }} />}
    </div>
  );
}