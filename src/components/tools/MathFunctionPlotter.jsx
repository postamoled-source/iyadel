import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Plus, Trash2, Save, Download, Upload, ZoomIn, ZoomOut, RotateCcw,
  Grid3x3, Share2, Image as ImageIcon, X,
} from "lucide-react";

const COLORS = ["#7c3aed", "#0ea5e9", "#f59e0b", "#ef4444"];
const MAX_FN = 4;
const STORAGE_KEY = "iyadel_saved_sets";

const PRESETS = ["x^2", "sin(x)", "cos(x)", "tan(x)", "sqrt(x)", "ln(x)", "exp(x)", "1/x", "abs(x)", "x^3 - 3*x"];

const STR = {
  ar: {
    functions: "الدوال", addFunction: "إضافة دالة", clearAll: "مسح الكل",
    quickExamples: "أمثلة سريعة", plotRange: "نطاق الرسم", applyRange: "تطبيق النطاق",
    savedSets: "المحفوظات", saveName: "اسم المجموعة...", zoomIn: "تكبير", zoomOut: "تصغير",
    reset: "إعادة", grid: "الشبكة", exportPng: "PNG", share: "مشاركة",
    valueTable: "جدول القيم", noSaved: "لا توجد مجموعات محفوظة بعد", fnCount: "د", delete: "حذف",
    changeColor: "تغيير اللون", example: "مثال: sin(x)",
    saved: "تم حفظ", updated: "تم تحديث", loaded: "تم تحميل", deleted: "تم حذف", cleared: "تم المسح",
    exported: "تم تصدير الملف", imported: "تم الاستيراد", shared: "تم نسخ رابط المشاركة",
    rangeApplied: "تم تطبيق النطاق", enterName: "اكتب اسمًا أولاً", maxFn: "الحد الأقصى 4 دوال",
    minFn: "يجب أن تبقى دالة واحدة على الأقل", invalidNums: "تأكد من إدخال أرقام صحيحة",
    minLessMax: "القيمة الدنيا يجب أن تكون أصغر من العليا", invalidFile: "ملف غير صالح",
    fileTooBig: "الملف كبير جدًا", invalidJson: "ملف JSON غير صالح", readErr: "تعذّر قراءة الملف",
    saveFailed: "تعذّر الحفظ", notFound: "لم يُعثر على", notSaved: "غير محفوظة",
  },
  en: {
    functions: "Functions", addFunction: "Add Function", clearAll: "Clear All",
    quickExamples: "Quick Examples", plotRange: "Plot Range", applyRange: "Apply Range",
    savedSets: "Saved Sets", saveName: "Set name...", zoomIn: "Zoom In", zoomOut: "Zoom Out",
    reset: "Reset", grid: "Grid", exportPng: "PNG", share: "Share",
    valueTable: "Value Table", noSaved: "No saved sets yet", fnCount: "fn", delete: "Delete",
    changeColor: "Change color", example: "e.g. sin(x)",
    saved: "Saved", updated: "Updated", loaded: "Loaded", deleted: "Deleted", cleared: "Cleared",
    exported: "File exported", imported: "Imported", shared: "Share link copied",
    rangeApplied: "Range applied", enterName: "Enter a name first", maxFn: "Maximum 4 functions",
    minFn: "At least one function required", invalidNums: "Please enter valid numbers",
    minLessMax: "Min must be less than Max", invalidFile: "Invalid file",
    fileTooBig: "File too large", invalidJson: "Invalid JSON file", readErr: "Could not read file",
    saveFailed: "Could not save", notFound: "Not found", notSaved: "not saved",
  },
};

let _id = 0;
const uid = () => `fn_${++_id}`;

function parseExpression(str) {
  let s = String(str).toLowerCase().trim();
  if (!s) return null;
  s = s.replace(/π/g, "pi").replace(/\^/g, "**");
  s = s.replace(/\bpi\b/g, "(Math.PI)").replace(/\be\b/g, "(Math.E)");
  const fns = {
    sin: "sin", cos: "cos", tan: "tan", asin: "asin", acos: "acos", atan: "atan",
    sinh: "sinh", cosh: "cosh", tanh: "tanh", sqrt: "sqrt", cbrt: "cbrt",
    ln: "log", log: "log10", log2: "log2", exp: "exp", abs: "abs",
    floor: "floor", ceil: "ceil", round: "round", sign: "sign",
  };
  Object.keys(fns).forEach((name) => {
    s = s.replace(new RegExp("\\b" + name + "\\b", "g"), "Math." + fns[name]);
  });
  s = s.replace(/(\d)\s*([a-z(])/g, "$1*$2");
  s = s.replace(/(\))\s*(\d)/g, "$1*$2");
  s = s.replace(/(\))\s*([a-z(])/g, "$1*$2");
  s = s.replace(/(x)\s*(\d)/g, "$1*$2");
  return s;
}

function compileFn(expr) {
  try {
    const js = parseExpression(expr);
    if (!js) return null;
    const f = new Function("x", "with(Math){ return (" + js + "); }");
    const t = f(0.5);
    if (typeof t !== "number" && t !== undefined && isNaN(t)) return null;
    return f;
  } catch {
    return null;
  }
}

const round2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => {
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(1);
  return String(Math.round(n * 1000) / 1000);
};

function niceStep(range) {
  const raw = range / 10;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  if (n < 1.5) return pow;
  if (n < 3) return 2 * pow;
  if (n < 7) return 5 * pow;
  return 10 * pow;
}

export default function MathFunctionPlotter() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const S = isAr ? STR.ar : STR.en;
  const dir = isAr ? "rtl" : "ltr";

  const [functions, setFunctions] = useState([{ id: uid(), expr: "x^2", color: COLORS[0], visible: true }]);
  const [view, setView] = useState({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  const [showGrid, setShowGrid] = useState(true);
  const [savedSets, setSavedSets] = useState({});
  const [saveName, setSaveName] = useState("");
  const [toast, setToast] = useState({ msg: "", err: false });
  const [coords, setCoords] = useState("x = 0.00   y = 0.00");
  const [isDark, setIsDark] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const viewRef = useRef(view);
  const functionsRef = useRef(functions);
  const gridRef = useRef(showGrid);
  const darkRef = useRef(false);
  const draggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef(0);
  const toastTimer = useRef(null);

  viewRef.current = view;
  functionsRef.current = functions;
  gridRef.current = showGrid;
  darkRef.current = isDark;

  const showToast = useCallback((msg, err = false) => {
    setToast({ msg, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ msg: "", err: false }), 2200);
  }, []);

  // Dark mode detection
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Load saved sets
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedSets(JSON.parse(raw));
    } catch {}
  }, []);

  // Load from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    if (name) {
      try {
        const sets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        if (sets[name]) {
          applyState(sets[name]);
          setSaveName(name);
          return;
        }
      } catch {}
    }
    const f = params.get("f");
    if (f) {
      const parts = f.split(";").map((s) => s.trim()).filter(Boolean).slice(0, MAX_FN);
      if (parts.length) {
        setFunctions(parts.map((expr, i) => ({ id: uid(), expr, color: COLORS[i % COLORS.length], visible: true })));
      }
    }
    const v = params.get("v");
    if (v) {
      const nums = v.split(",").map(parseFloat);
      if (nums.length === 4 && !nums.some(isNaN) && nums[0] < nums[1] && nums[2] < nums[3]) {
        setView({ xMin: nums[0], xMax: nums[1], yMin: nums[2], yMax: nums[3] });
      }
    }
  }, []);

  const applyState = (state) => {
    if (!state || !Array.isArray(state.fns)) { showToast(S.invalidFile, true); return; }
    const fns = state.fns.slice(0, MAX_FN).map((f, i) => ({
      id: uid(), expr: String(f.expr || ""), color: f.color || COLORS[i % COLORS.length], visible: true,
    }));
    setFunctions(fns.length ? fns : [{ id: uid(), expr: "x^2", color: COLORS[0], visible: true }]);
    if (state.view) {
      const v = state.view;
      if ([v.xMin, v.xMax, v.yMin, v.yMax].every((n) => typeof n === "number" && !isNaN(n)) && v.xMin < v.xMax && v.yMin < v.yMax) {
        setView({ xMin: v.xMin, xMax: v.xMax, yMin: v.yMin, yMax: v.yMax });
      }
    }
    if (typeof state.grid === "boolean") setShowGrid(state.grid);
  };

  // ---- Canvas drawing ----
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const w = rect.width, h = rect.height;
    const v = viewRef.current;
    const dark = darkRef.current;
    const grid = gridRef.current;

    const xToPx = (x) => ((x - v.xMin) / (v.xMax - v.xMin)) * w;
    const yToPx = (y) => h - ((y - v.yMin) / (v.yMax - v.yMin)) * h;

    ctx.fillStyle = dark ? "#1E1B4B" : "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Grid
    if (grid) {
      ctx.strokeStyle = dark ? "#2D2A5A" : "#eef0f5";
      ctx.lineWidth = 1;
      const xStep = niceStep(v.xMax - v.xMin);
      const yStep = niceStep(v.yMax - v.yMin);
      for (let x = Math.ceil(v.xMin / xStep) * xStep; x <= v.xMax; x += xStep) {
        const px = xToPx(x);
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      }
      for (let y = Math.ceil(v.yMin / yStep) * yStep; y <= v.yMax; y += yStep) {
        const py = yToPx(y);
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
      }
    }

    // Axes
    ctx.strokeStyle = dark ? "#8B8AB0" : "#94a3b8";
    ctx.lineWidth = 1.5;
    const y0 = yToPx(0), x0 = xToPx(0);
    if (y0 >= 0 && y0 <= h) { ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke(); }
    if (x0 >= 0 && x0 <= w) { ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke(); }

    // Axis labels
    ctx.fillStyle = dark ? "#D6D2EE" : "#64748b";
    ctx.font = "11px 'Segoe UI', sans-serif";
    const xStep = niceStep(v.xMax - v.xMin);
    const yStep = niceStep(v.yMax - v.yMin);
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let x = Math.ceil(v.xMin / xStep) * xStep; x <= v.xMax; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue;
      const px = xToPx(x);
      ctx.fillText(fmt(x), px, Math.min(Math.max(y0 + 5, 5), h - 18));
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let y = Math.ceil(v.yMin / yStep) * yStep; y <= v.yMax; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue;
      const py = yToPx(y);
      ctx.fillText(fmt(y), Math.min(Math.max(x0 - 6, 30), w - 6), py);
    }
    ctx.textAlign = "right"; ctx.textBaseline = "top";
    if (x0 >= 0 && x0 <= w && y0 >= 0 && y0 <= h) ctx.fillText("0", x0 - 5, y0 + 4);

    // Functions
    functionsRef.current.forEach((fn) => {
      if (!fn.visible || !fn.expr.trim()) return;
      const compiled = compileFn(fn.expr);
      if (!compiled) return;
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      const steps = Math.min(w * 2, 2400);
      let started = false, prevY = null;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = v.xMin + (i / steps) * (v.xMax - v.xMin);
        let y;
        try { y = compiled(x); } catch { y = NaN; }
        if (typeof y !== "number" || !isFinite(y) || isNaN(y)) { started = false; prevY = null; continue; }
        const px = xToPx(x), py = yToPx(y);
        if (py < -h * 3 || py > h * 4) { started = false; prevY = null; continue; }
        if (prevY !== null && Math.abs(py - prevY) > h * 0.7) started = false;
        if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
        prevY = py;
      }
      ctx.stroke();
    });
  }, []);

  // Redraw on state changes
  useEffect(() => {
    draw();
    syncUrl();
  }, [functions, view, showGrid, isDark, draw]);

  // Resize observer
  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", draw);
    return () => { ro.disconnect(); window.removeEventListener("resize", draw); };
  }, [draw]);

  // ---- URL sync ----
  const syncUrl = useCallback(() => {
    const exprs = functionsRef.current.map((f) => f.expr.trim()).filter(Boolean);
    const params = new URLSearchParams();
    if (exprs.length) params.set("f", exprs.join(";"));
    params.set("v", [round2(view.xMin), round2(view.xMax), round2(view.yMin), round2(view.yMax)].join(","));
    try { history.replaceState(null, "", `${location.pathname}?${params}`); } catch {}
  }, []);

  // ---- Zoom / Pan ----
  const zoomAt = (factor, centerX, centerY) => {
    setView((v) => {
      const cx = centerX ?? (v.xMin + v.xMax) / 2;
      const cy = centerY ?? (v.yMin + v.yMax) / 2;
      const hw = ((v.xMax - v.xMin) / 2) * factor;
      const hh = ((v.yMax - v.yMin) / 2) * factor;
      return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    });
  };

  const pxToX = (px) => { const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return 0; return viewRef.current.xMin + (px / rect.width) * (viewRef.current.xMax - viewRef.current.xMin); };
  const pxToY = (py) => { const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return 0; return viewRef.current.yMax - (py / rect.height) * (viewRef.current.yMax - viewRef.current.yMin); };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = pxToX(e.clientX - rect.left);
    const cy = pxToY(e.clientY - rect.top);
    zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, cx, cy);
  };

  const onMouseDown = (e) => { draggingRef.current = true; lastPosRef.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    setCoords(`x = ${pxToX(mx).toFixed(2)}   y = ${pxToY(my).toFixed(2)}`);
    if (!draggingRef.current) return;
    const v = viewRef.current;
    const dx = ((e.clientX - lastPosRef.current.x) / rect.width) * (v.xMax - v.xMin);
    const dy = ((e.clientY - lastPosRef.current.y) / rect.height) * (v.yMax - v.yMin);
    setView({ xMin: v.xMin - dx, xMax: v.xMax - dx, yMin: v.yMin + dy, yMax: v.yMax + dy });
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { draggingRef.current = false; };
  const onMouseLeave = () => { setCoords("x = 0.00   y = 0.00"); };

  // Touch
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      draggingRef.current = true;
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      draggingRef.current = false;
      touchDistRef.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && draggingRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const v = viewRef.current;
      const dx = ((e.touches[0].clientX - lastPosRef.current.x) / rect.width) * (v.xMax - v.xMin);
      const dy = ((e.touches[0].clientY - lastPosRef.current.y) / rect.height) * (v.yMax - v.yMin);
      setView({ xMin: v.xMin - dx, xMax: v.xMax - dx, yMin: v.yMin + dy, yMax: v.yMax + dy });
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const nd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (touchDistRef.current > 0) zoomAt(touchDistRef.current / nd);
      touchDistRef.current = nd;
    }
  };
  const onTouchEnd = () => { draggingRef.current = false; touchDistRef.current = 0; };

  // ---- Actions ----
  const addFn = () => {
    if (functions.length >= MAX_FN) { showToast(S.maxFn, true); return; }
    setFunctions((p) => [...p, { id: uid(), expr: "", color: COLORS[p.length % COLORS.length], visible: true }]);
  };
  const removeFn = (id) => {
    if (functions.length <= 1) { showToast(S.minFn, true); return; }
    setFunctions((p) => p.filter((f) => f.id !== id));
  };
  const updateFn = (id, field, value) => {
    setFunctions((p) => p.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };
  const clearAll = () => {
    setFunctions([{ id: uid(), expr: "x^2", color: COLORS[0], visible: true }]);
    showToast(S.cleared);
  };
  const applyPreset = (preset) => {
    const empty = functions.find((f) => !f.expr.trim());
    if (empty) updateFn(empty.id, "expr", preset);
    else if (functions.length < MAX_FN) setFunctions((p) => [...p, { id: uid(), expr: preset, color: COLORS[p.length % COLORS.length], visible: true }]);
    else updateFn(functions[0].id, "expr", preset);
  };
  const applyView = () => {
    const xmin = parseFloat(document.getElementById("mfp-xmin")?.value ?? view.xMin);
    const xmax = parseFloat(document.getElementById("mfp-xmax")?.value ?? view.xMax);
    const ymin = parseFloat(document.getElementById("mfp-ymin")?.value ?? view.yMin);
    const ymax = parseFloat(document.getElementById("mfp-ymax")?.value ?? view.yMax);
    if ([xmin, xmax, ymin, ymax].some(isNaN)) { showToast(S.invalidNums, true); return; }
    if (xmin >= xmax || ymin >= ymax) { showToast(S.minLessMax, true); return; }
    setView({ xMin: xmin, xMax: xmax, yMin: ymin, yMax: ymax });
    showToast(S.rangeApplied);
  };
  const resetView = () => setView({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });

  // Saved sets
  const persistSets = (sets) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sets)); return true; }
    catch { showToast(S.saveFailed, true); return false; }
  };
  const saveSet = () => {
    const name = saveName.trim();
    if (!name) { showToast(S.enterName, true); return; }
    const existed = !!savedSets[name];
    const snap = {
      fns: functions.map((f) => ({ expr: f.expr, color: f.color })),
      view: { xMin: round2(view.xMin), xMax: round2(view.xMax), yMin: round2(view.yMin), yMax: round2(view.yMax) },
      grid: showGrid, savedAt: Date.now(), version: 1,
    };
    const next = { ...savedSets, [name]: snap };
    if (persistSets(next)) {
      setSavedSets(next);
      setSaveName("");
      showToast(existed ? `${S.updated} "${name}"` : `${S.saved} "${name}" ✅`);
    }
  };
  const loadSet = (name) => {
    if (!savedSets[name]) { showToast(`${S.notFound} "${name}"`, true); return; }
    applyState(savedSets[name]);
    showToast(`${S.loaded} "${name}"`);
  };
  const deleteSet = (name) => {
    const next = { ...savedSets };
    delete next[name];
    persistSets(next);
    setSavedSets(next);
    showToast(`${S.deleted} "${name}"`);
  };

  // Export PNG
  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const exp = document.createElement("canvas");
    exp.width = rect.width * 2; exp.height = rect.height * 2;
    const ectx = exp.getContext("2d");
    ectx.scale(2, 2);
    const oldCanvas = canvasRef.current;
    const oldCtx = canvasRef.current.getContext("2d");
    // Temporarily swap refs for draw
    canvasRef.current = exp;
    // Re-run draw logic inline
    const dpr = 1;
    const w = rect.width, h = rect.height;
    const v = viewRef.current;
    const dark = darkRef.current;
    const grid = gridRef.current;
    const xToPx = (x) => ((x - v.xMin) / (v.xMax - v.xMin)) * w;
    const yToPx = (y) => h - ((y - v.yMin) / (v.yMax - v.yMin)) * h;
    ectx.fillStyle = dark ? "#1E1B4B" : "#ffffff";
    ectx.fillRect(0, 0, w, h);
    if (grid) {
      ectx.strokeStyle = dark ? "#2D2A5A" : "#eef0f5"; ectx.lineWidth = 1;
      const xStep = niceStep(v.xMax - v.xMin), yStep = niceStep(v.yMax - v.yMin);
      for (let x = Math.ceil(v.xMin / xStep) * xStep; x <= v.xMax; x += xStep) { const px = xToPx(x); ectx.beginPath(); ectx.moveTo(px, 0); ectx.lineTo(px, h); ectx.stroke(); }
      for (let y = Math.ceil(v.yMin / yStep) * yStep; y <= v.yMax; y += yStep) { const py = yToPx(y); ectx.beginPath(); ectx.moveTo(0, py); ectx.lineTo(w, py); ectx.stroke(); }
    }
    ectx.strokeStyle = dark ? "#8B8AB0" : "#94a3b8"; ectx.lineWidth = 1.5;
    const y0 = yToPx(0), x0 = xToPx(0);
    if (y0 >= 0 && y0 <= h) { ectx.beginPath(); ectx.moveTo(0, y0); ectx.lineTo(w, y0); ectx.stroke(); }
    if (x0 >= 0 && x0 <= w) { ectx.beginPath(); ectx.moveTo(x0, 0); ectx.lineTo(x0, h); ectx.stroke(); }
    functionsRef.current.forEach((fn) => {
      if (!fn.visible || !fn.expr.trim()) return;
      const compiled = compileFn(fn.expr);
      if (!compiled) return;
      ectx.strokeStyle = fn.color; ectx.lineWidth = 2.4; ectx.lineJoin = "round"; ectx.lineCap = "round";
      const steps = Math.min(w * 2, 2400);
      let started = false, prevY = null;
      ectx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = v.xMin + (i / steps) * (v.xMax - v.xMin);
        let y; try { y = compiled(x); } catch { y = NaN; }
        if (typeof y !== "number" || !isFinite(y) || isNaN(y)) { started = false; prevY = null; continue; }
        const px = xToPx(x), py = yToPx(y);
        if (py < -h * 3 || py > h * 4) { started = false; prevY = null; continue; }
        if (prevY !== null && Math.abs(py - prevY) > h * 0.7) started = false;
        if (!started) { ectx.moveTo(px, py); started = true; } else { ectx.lineTo(px, py); }
        prevY = py;
      }
      ectx.stroke();
    });
    canvasRef.current = oldCanvas;
    const a = document.createElement("a");
    a.download = `math-function-${Date.now()}.png`;
    a.href = exp.toDataURL("image/png");
    a.click();
    showToast(S.exported);
  };

  // Export JSON
  const exportJson = () => {
    const data = { app: "iyadel-math-calculator", version: 1, exportedAt: new Date().toISOString(), state: {
      fns: functions.map((f) => ({ expr: f.expr, color: f.color })),
      view: { xMin: round2(view.xMin), xMax: round2(view.xMax), yMin: round2(view.yMin), yMax: round2(view.yMax) },
      grid: showGrid,
    }};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `math-functions-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(S.exported);
  };

  // Import JSON
  const importJson = (file) => {
    if (!file) return;
    if (file.size > 102400) { showToast(S.fileTooBig, true); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        applyState(data.state || data);
        showToast(`${S.imported} ✅`);
      } catch { showToast(S.invalidJson, true); }
    };
    reader.onerror = () => showToast(S.readErr, true);
    reader.readAsText(file);
  };

  // Share URL
  const shareUrl = () => {
    const exprs = functions.map((f) => f.expr.trim()).filter(Boolean);
    const params = new URLSearchParams();
    if (exprs.length) params.set("f", exprs.join(";"));
    params.set("v", [round2(view.xMin), round2(view.xMax), round2(view.yMin), round2(view.yMax)].join(","));
    const url = `${location.origin}${location.pathname}?${params}`;
    try { history.replaceState(null, "", url); } catch {}
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast(`📋 ${S.shared}`)).catch(() => fallbackCopy(url));
    } else fallbackCopy(url);
  };
  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); showToast(`📋 ${S.shared}`); } catch { prompt("Copy:", text); }
    document.body.removeChild(ta);
  };

  // Value table
  const tableXs = [-3, -2, -1, 0, 1, 2, 3];
  const darkCls = isDark ? "dark" : "";

  const savedNames = Object.keys(savedSets).sort((a, b) => (savedSets[b].savedAt || 0) - (savedSets[a].savedAt || 0));

  const toolBtnBase = "inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border text-[13px] font-medium transition-all";

  return (
    <div dir={dir} className={`math-function-plotter ${darkCls}`}>
      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        {/* Control Panel */}
        <aside className="bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] dark:border-[#4B3F8A]">
            <h2 className="text-[15px] font-semibold text-[#111827] dark:text-[#FEF3C7] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6D28D9]" /> {S.functions}
            </h2>
            <button onClick={clearAll} title={S.clearAll} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] dark:text-[#8B8AB0] hover:bg-[#FEE2E2] hover:text-[#dc2626] transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4 space-y-2.5">
            {functions.map((fn, i) => (
              <div key={fn.id} className="flex items-center gap-2 bg-[#FAFAFC] dark:bg-[#1E1B4B] border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-[10px] px-2.5 py-2 focus-within:border-[#6D28D9] focus-within:ring-2 focus-within:ring-[#6D28D9]/10 transition-all">
                <input type="color" value={fn.color} onChange={(e) => updateFn(fn.id, "color", e.target.value)} title={S.changeColor}
                  className="w-7 h-7 rounded-md cursor-pointer border-0 p-0 shrink-0" style={{ background: "none" }} />
                <span className="font-mono text-[13px] text-[#94A3B8] dark:text-[#8B8AB0] select-none">f{i + 1}(x)=</span>
                <input type="text" value={fn.expr} onChange={(e) => updateFn(fn.id, "expr", e.target.value)} placeholder={S.example} spellCheck={false} autoComplete="off"
                  className="flex-1 min-w-0 border-none bg-transparent px-1 py-1.5 font-mono text-[14px] text-[#0f172a] dark:text-[#FEF3C7] ltr text-left outline-none" dir="ltr" />
                <button onClick={() => removeFn(fn.id)} title={S.delete} className="w-6 h-6 rounded-md flex items-center justify-center text-[#94A3B8] hover:bg-[#FEE2E2] hover:text-[#dc2626] transition-all shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={addFn} disabled={functions.length >= MAX_FN}
              className="w-full py-2.5 border border-dashed border-[#cbd5e1] dark:border-[#4B3F8A] rounded-[10px] text-[#475569] dark:text-[#D6D2EE] text-[14px] font-medium hover:border-[#6D28D9] hover:text-[#6D28D9] hover:bg-[#6D28D9]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> {S.addFunction}
            </button>

            {/* Presets */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#4B3F8A]">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-[#8B8AB0] mb-2.5">{S.quickExamples}</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p} onClick={() => applyPreset(p)} className="px-2.5 py-1.5 border border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] rounded-lg font-mono text-[12px] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9] hover:bg-[#6D28D9]/5 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* View Range */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#4B3F8A]">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-[#8B8AB0] mb-2.5">{S.plotRange}</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[12px] font-semibold text-[#94A3B8] dark:text-[#8B8AB0] mb-1 font-mono">X min</label>
                  <input id="mfp-xmin" type="number" defaultValue={view.xMin} step="1" className="w-full px-2.5 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg bg-[#FAFAFC] dark:bg-[#1E1B4B] text-[#0f172a] dark:text-[#FEF3C7] font-mono text-[13px] ltr text-left outline-none focus:border-[#6D28D9]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#94A3B8] dark:text-[#8B8AB0] mb-1 font-mono">X max</label>
                  <input id="mfp-xmax" type="number" defaultValue={view.xMax} step="1" className="w-full px-2.5 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg bg-[#FAFAFC] dark:bg-[#1E1B4B] text-[#0f172a] dark:text-[#FEF3C7] font-mono text-[13px] ltr text-left outline-none focus:border-[#6D28D9]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#94A3B8] dark:text-[#8B8AB0] mb-1 font-mono">Y min</label>
                  <input id="mfp-ymin" type="number" defaultValue={view.yMin} step="1" className="w-full px-2.5 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg bg-[#FAFAFC] dark:bg-[#1E1B4B] text-[#0f172a] dark:text-[#FEF3C7] font-mono text-[13px] ltr text-left outline-none focus:border-[#6D28D9]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#94A3B8] dark:text-[#8B8AB0] mb-1 font-mono">Y max</label>
                  <input id="mfp-ymax" type="number" defaultValue={view.yMax} step="1" className="w-full px-2.5 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg bg-[#FAFAFC] dark:bg-[#1E1B4B] text-[#0f172a] dark:text-[#FEF3C7] font-mono text-[13px] ltr text-left outline-none focus:border-[#6D28D9]" dir="ltr" />
                </div>
              </div>
              <button onClick={applyView} className="w-full mt-2.5 py-2 border border-dashed border-[#cbd5e1] dark:border-[#4B3F8A] rounded-[10px] text-[14px] font-medium text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all">{S.applyRange}</button>
            </div>

            {/* Saved Sets */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#4B3F8A]">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-[#8B8AB0] mb-2.5">{S.savedSets}</div>
              <div className="flex gap-1.5 mb-2.5">
                <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveSet()} placeholder={S.saveName} maxLength={30}
                  className="flex-1 min-w-0 px-2.5 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg bg-[#FAFAFC] dark:bg-[#1E1B4B] text-[#0f172a] dark:text-[#FEF3C7] text-[13px] outline-none focus:border-[#6D28D9]" />
                <button onClick={saveSet} title={S.save} className="w-9 h-9 shrink-0 rounded-lg border border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] flex items-center justify-center text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all">
                  <Save className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto mb-2.5">
                {savedNames.length === 0 ? (
                  <div className="text-[12.5px] text-[#94A3B8] dark:text-[#8B8AB0] text-center py-3.5 border border-dashed border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg italic">{S.noSaved}</div>
                ) : savedNames.map((name) => (
                  <div key={name} onClick={() => loadSet(name)} title={name} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAFC] dark:bg-[#1E1B4B] border border-[#E2E8F0] dark:border-[#4B3F8A] rounded-lg cursor-pointer text-[13px] hover:border-[#6D28D9] hover:bg-[#6D28D9]/5 transition-all">
                    <span className="flex-1 truncate font-medium text-[#0f172a] dark:text-[#FEF3C7]">{name}</span>
                    <span className="text-[11px] text-[#94A3B8] dark:text-[#8B8AB0] font-mono">{(savedSets[name].fns || []).length}{S.fnCount}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteSet(name); }} className="text-[#94A3B8] hover:text-[#dc2626] px-1 transition-colors"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={exportJson} className="flex-1 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] rounded-lg text-[12.5px] font-medium text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all flex items-center justify-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
                <label className="flex-1 py-2 border border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] rounded-lg text-[12.5px] font-medium text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> JSON
                  <input type="file" accept=".json,application/json" className="hidden" onChange={(e) => { if (e.target.files[0]) { importJson(e.target.files[0]); e.target.value = ""; } }} />
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Chart Panel */}
        <main className="bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[420px]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F3F4F6] dark:border-[#4B3F8A] flex-wrap">
            <button onClick={() => zoomAt(1 / 1.25)} title={S.zoomIn} className={`${toolBtnBase} border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9]`}>
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => zoomAt(1.25)} title={S.zoomOut} className={`${toolBtnBase} border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9]`}>
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetView} title={S.reset} className={`${toolBtnBase} border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9]`}>
              <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{S.reset}</span>
            </button>
            <button onClick={() => setShowGrid((s) => !s)} title={S.grid} className={`${toolBtnBase} ${showGrid ? "bg-[#6D28D9] border-[#6D28D9] text-white" : "border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9]"}`}>
              <Grid3x3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{S.grid}</span>
            </button>
            <button onClick={exportPng} title={S.exportPng} className={`${toolBtnBase} border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9]`}>
              <ImageIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PNG</span>
            </button>
            <button onClick={shareUrl} title={S.share} className={`${toolBtnBase} border-[#E2E8F0] dark:border-[#4B3F8A] bg-white dark:bg-[#1E1B4B] text-[#475569] dark:text-[#D6D2EE] hover:border-[#6D28D9] hover:text-[#6D28D9]`}>
              <Share2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{S.share}</span>
            </button>
            <div className="flex-1" />
            <div className="font-mono text-[12px] text-[#94A3B8] dark:text-[#8B8AB0] bg-[#FAFAFC] dark:bg-[#1E1B4B] px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#4B3F8A] min-w-[130px] sm:min-w-[180px] text-center" dir="ltr">{coords}</div>
          </div>
          <div ref={containerRef} className="relative flex-1 min-h-[340px] bg-white dark:bg-[#1E1B4B] overflow-hidden">
            <canvas
              ref={canvasRef}
              className="block w-full h-full cursor-grab active:cursor-grabbing touch-none"
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          </div>
        </main>
      </div>

      {/* Value Table */}
      <div className="mt-5 bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F3F4F6] dark:border-[#4B3F8A]">
          <h2 className="text-[15px] font-semibold text-[#111827] dark:text-[#FEF3C7] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6D28D9]" /> {S.valueTable}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] font-mono border-collapse">
            <thead>
              <tr className="bg-[#FAFAFC] dark:bg-[#1E1B4B]">
                <th className="px-2 py-2.5 text-center font-semibold text-[#475569] dark:text-[#8B8AB0] text-[12px] uppercase border-b border-[#E2E8F0] dark:border-[#4B3F8A]">x</th>
                {functions.map((fn, i) => (
                  <th key={fn.id} className="px-2 py-2.5 text-center font-semibold text-[#475569] dark:text-[#8B8AB0] text-[12px] uppercase border-b border-[#E2E8F0] dark:border-[#4B3F8A]">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: fn.color }} />f{i + 1}(x)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableXs.map((x) => (
                <tr key={x} className="even:bg-[#FAFAFA] dark:even:bg-[#252253]">
                  <td className="px-2 py-2 text-center text-[#0f172a] dark:text-[#FEF3C7] border-b border-[#E2E8F0] dark:border-[#4B3F8A]">{x}</td>
                  {functions.map((fn) => {
                    const compiled = compileFn(fn.expr);
                    let y = "—";
                    if (compiled) { try { const v = compiled(x); if (typeof v === "number" && isFinite(v) && !isNaN(v)) y = Math.round(v * 1000) / 1000; } catch {} }
                    return <td key={fn.id} className="px-2 py-2 text-center text-[#0f172a] dark:text-[#FEF3C7] border-b border-[#E2E8F0] dark:border-[#4B3F8A]">{y}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed bottom-6 ${isAr ? "left-6" : "right-6"} z-50 px-4 py-3 rounded-xl text-[14px] font-medium shadow-lg transition-all ${toast.err ? "bg-[#dc2626] text-white" : "bg-[#0f172a] dark:bg-[#FEF3C7] dark:text-[#1E1B4B] text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}