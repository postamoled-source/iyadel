import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const inputClass =
  "w-full bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] rounded-xl px-3 py-2.5 text-sm text-[#111827] dark:text-[#FEF3C7] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 min-h-[44px]";
const labelClass = "block text-[11px] font-semibold text-[#6B7280] dark:text-[#A8A6C4] mb-1";

const EMPTY = {
  title: "", media_type: "movie", overview: "", poster_url: "", release_year: "",
  country: "", rating: "", trailer_url: "", watch_url: "",
  genres: "", download_links: [{ quality: "1080p", url: "" }],
};

export default function AddMovieDialog({ lang, onAdded, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const L = lang === "ar"
    ? { title: "إضافة عمل جديد", name: "الاسم", type: "النوع", movie: "فيلم", tv: "مسلسل",
        overview: "الوصف", poster: "رابط البوستر", year: "سنة الإصدار", country: "الدولة",
        genres: "التصنيفات (افصل بفاصلة)", rating: "التقييم (0-10)", trailer: "رابط الإعلان (YouTube)",
        watch: "رابط المشاهدة الرسمي", downloads: "روابط التحميل", quality: "الجودة", url: "الرابط",
        addQuality: "إضافة جودة", save: "حفظ", saving: "جارٍ الحفظ...", cancel: "إلغاء", required: "الاسم مطلوب" }
    : { title: "Add a new title", name: "Title", type: "Type", movie: "Movie", tv: "Series",
        overview: "Overview", poster: "Poster URL", year: "Release year", country: "Country",
        genres: "Genres (comma separated)", rating: "Rating (0-10)", trailer: "Trailer URL (YouTube)",
        watch: "Official watch link", downloads: "Download links", quality: "Quality", url: "URL",
        addQuality: "Add quality", save: "Save", saving: "Saving...", cancel: "Cancel", required: "Title is required" };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setLink = (i, k, v) =>
    setForm((f) => {
      const links = [...f.download_links];
      links[i] = { ...links[i], [k]: v };
      return { ...f, download_links: links };
    });

  const addLink = () => setForm((f) => ({ ...f, download_links: [...f.download_links, { quality: "", url: "" }] }));
  const removeLink = (i) => setForm((f) => ({ ...f, download_links: f.download_links.filter((_, j) => j !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError(L.required); return; }
    setSaving(true);
    setError("");
    try {
      await base44.entities.MovieEntry.create({
        title: form.title.trim(),
        media_type: form.media_type,
        overview: form.overview.trim(),
        poster_url: form.poster_url.trim(),
        release_year: form.release_year.trim(),
        country: form.country.trim(),
        genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
        rating: Number(form.rating) || 0,
        trailer_url: form.trailer_url.trim(),
        watch_url: form.watch_url.trim(),
        download_links: form.download_links.filter((l) => l.url.trim()),
        status: "published",
      });
      setForm(EMPTY);
      onAdded?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-[#FFFBEB] dark:bg-[#1E1B4B] w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#E9D5FF] dark:border-[#4B3F8A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-[#FFFBEB] dark:bg-[#1E1B4B] border-b border-[#F3F4F6] dark:border-[#4B3F8A]">
          <h2 className="text-base font-bold text-[#111827] dark:text-[#FEF3C7]">{L.title}</h2>
          <button onClick={onClose} aria-label={L.cancel} className="text-[#6B7280] hover:text-[#6D28D9]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3.5">
          <div>
            <label className={labelClass}>{L.name} *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{L.type}</label>
              <select value={form.media_type} onChange={(e) => set("media_type", e.target.value)} className={inputClass}>
                <option value="movie">{L.movie}</option>
                <option value="tv">{L.tv}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{L.year}</label>
              <input value={form.release_year} onChange={(e) => set("release_year", e.target.value)} inputMode="numeric" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{L.overview}</label>
            <textarea value={form.overview} onChange={(e) => set("overview", e.target.value)} rows={3} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{L.poster}</label>
            <input value={form.poster_url} onChange={(e) => set("poster_url", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{L.country}</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{L.rating}</label>
              <input value={form.rating} onChange={(e) => set("rating", e.target.value)} inputMode="decimal" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{L.genres}</label>
            <input value={form.genres} onChange={(e) => set("genres", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{L.trailer}</label>
            <input value={form.trailer_url} onChange={(e) => set("trailer_url", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{L.watch}</label>
            <input value={form.watch_url} onChange={(e) => set("watch_url", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{L.downloads}</label>
            <div className="space-y-2">
              {form.download_links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={l.quality}
                    onChange={(e) => setLink(i, "quality", e.target.value)}
                    placeholder={L.quality}
                    className={`${inputClass} w-28 shrink-0`}
                  />
                  <input
                    value={l.url}
                    onChange={(e) => setLink(i, "url", e.target.value)}
                    placeholder={L.url}
                    className={inputClass}
                  />
                  {form.download_links.length > 1 && (
                    <button type="button" onClick={() => removeLink(i)} className="shrink-0 text-[#9CA3AF] hover:text-[#DC2626]" aria-label={L.cancel}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addLink} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D28D9] dark:text-[#FBBF24]">
              <Plus className="w-3.5 h-3.5" /> {L.addQuality}
            </button>
          </div>

          {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#E9D5FF] dark:border-[#4B3F8A] text-sm font-semibold text-[#6B7280] dark:text-[#A8A6C4]"
            >
              {L.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(109,40,217,0.25)] disabled:opacity-60"
            >
              {saving ? L.saving : L.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}