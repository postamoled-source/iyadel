import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, ImagePlus, Save, FileText } from "lucide-react";

const BlogPostEntity = base44.entities.BlogPost;

const CATS = ["Finance", "Health", "Math", "Technology", "Games", "Science", "Lifestyle"];

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "Finance", image_url: "" });
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setPosts(await BlogPostEntity.list("-created_date", 100) || []); } catch { setPosts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((p) => ({ ...p, image_url: file_url }));
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Upload failed" });
    }
    setUploading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setMsg({ type: "error", text: "Title is required" }); return; }
    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content,
        category: form.category,
        image_url: form.image_url || "",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      await BlogPostEntity.create(data);
      setForm({ title: "", slug: "", excerpt: "", content: "", category: "Finance", image_url: "" });
      setMsg({ type: "success", text: "Post published successfully!" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to create post" });
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm("Delete this post permanently?")) return;
    try { await BlogPostEntity.delete(id); setPosts((p) => p.filter((x) => x.id !== id)); }
    catch (err) { setMsg({ type: "error", text: err.message || "Delete failed" }); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Create form */}
      <div className="rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Add New Post</h2>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={form.title} onChange={set("title")} placeholder="5 Smart Ways..." className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input id="slug" value={form.slug} onChange={set("slug")} placeholder="auto-generated from title" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input id="excerpt" value={form.excerpt} onChange={set("excerpt")} placeholder="Short summary..." className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea id="content" value={form.content} onChange={set("content")} rows={6} placeholder="Write the article body here..."
              className="w-full rounded-xl border border-border bg-background text-foreground text-sm px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" value={form.category} onChange={set("category")}
              className="w-full h-11 rounded-xl border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary">
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
              </label>
              {form.image_url && <span className="text-xs text-muted-foreground truncate flex-1">Uploaded ✓</span>}
            </div>
            {form.image_url && (
              <img src={form.image_url} alt="preview" className="mt-3 max-h-40 rounded-xl border border-border object-cover" />
            )}
          </div>
          <Button type="submit" disabled={saving} className="w-full h-12 font-semibold rounded-xl">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : <><Save className="w-4 h-4 mr-2" /> Publish Post</>}
          </Button>
        </form>
      </div>

      {/* Existing posts */}
      <div className="rounded-[2rem] bg-card border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-foreground">Published Posts ({posts.length})</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-muted-foreground animate-spin" /></div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-10">No posts yet. Create your first one!</p>
        ) : (
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-muted-foreground" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.date}</p>
                </div>
                <button onClick={() => remove(p.id)} aria-label="Delete"
                  className="shrink-0 w-9 h-9 rounded-lg border border-border text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}