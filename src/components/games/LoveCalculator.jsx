import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const STR = {
  en: {
    title: "Love Calculator",
    subtitle: "✦ Discover your compatibility ✦",
    name1: "👤 First person's name",
    name2: "👤 Second person's name",
    placeholder: "Type a name...",
    btn: "💞 Calculate Love",
    bar: "❤️‍🔥 ❤️ ❤️‍🔥 ❤️ ❤️‍🔥",
    initial: "💕 Enter both names and start!",
    welcome: "💫 Enter both names to discover the score 💫",
    enterBoth: "⚠️ Please enter both names",
    tooShort: "⚠️ Each name must be at least 2 characters",
    calculating: "✨ Calculating compatibility... ✨",
    footer: "✦ For entertainment only ✦",
    messages: {
      eternal: "💞 Eternal love! You are meant for each other 💞",
      great: "💖 Amazing match! A strong bond 💖",
      nice: "💗 A lovely start, keep getting to know each other 💗",
      work: "💔 Needs work, but hope remains 💔",
      nope: "😅 Destiny? Maybe... or maybe not 😅",
    },
  },
  ar: {
    title: "حاسبة الحب",
    subtitle: "✦ اكتشف نسبة التوافق بينكما ✦",
    name1: "👤 اسم الشخص الأول",
    name2: "👤 اسم الشخص الثاني",
    placeholder: "اكتب الاسم...",
    btn: "💞 احسب نسبة الحب",
    bar: "❤️‍🔥 ❤️ ❤️‍🔥 ❤️ ❤️‍🔥",
    initial: "💕 أدخل الاسمين وابدأ!",
    welcome: "💫 أدخل الاسمين واكتشف النسبة 💫",
    enterBoth: "⚠️ من فضلك أدخل الاسمين",
    tooShort: "⚠️ الاسم يجب أن يحتوي على حرفين على الأقل",
    calculating: "✨ جارٍ حساب التوافق... ✨",
    footer: "✦ للترفيه فقط ✦",
    messages: {
      eternal: "💞 حب أبدي! أنتم مكتوبون لبعضكم 💞",
      great: "💖 توافق رائع! علاقة قوية 💖",
      nice: "💗 بداية جميلة، استمروا في التعارف 💗",
      work: "💔 يحتاج إلى عمل، لكن الأمل موجود 💔",
      nope: "😅 نصيب؟ ربما... أو ربما لا 😅",
    },
  },
};

const HEART_EMOJIS = ["❤️", "💖", "💗", "💕", "💞", "♥️", "❤️‍🔥"];

function calculateLoveScore(name1, name2) {
  const sum1 = name1.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const sum2 = name2.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (sum1 * sum2) % 100;
}

function getMessage(score, s) {
  if (score >= 90) return s.messages.eternal;
  if (score >= 70) return s.messages.great;
  if (score >= 50) return s.messages.nice;
  if (score >= 30) return s.messages.work;
  return s.messages.nope;
}

export default function LoveCalculator() {
  const { lang } = useI18n();
  const s = STR[lang] || STR.en;
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [percent, setPercent] = useState("💕");
  const [message, setMessage] = useState(s.initial);
  const [hearts, setHearts] = useState([]);
  const heartId = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setPercent("💕");
    setMessage(s.welcome);
    spawnHearts(10);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function spawnHearts(count = 18) {
    const batch = [];
    for (let i = 0; i < count; i++) {
      batch.push({
        id: heartId.current++,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        left: Math.random() * 100,
        size: 1.2 + Math.random() * 2.2,
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 2,
      });
    }
    setHearts((prev) => [...prev, ...batch]);
    const ids = batch.map((b) => b.id);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !ids.includes(h.id)));
    }, 10000);
  }

  function calculate() {
    const n1 = name1.trim();
    const n2 = name2.trim();
    if (!n1 || !n2) {
      setPercent("💔");
      setMessage(s.enterBoth);
      return;
    }
    if (n1.length < 2 || n2.length < 2) {
      setPercent("💔");
      setMessage(s.tooShort);
      return;
    }
    const score = calculateLoveScore(n1, n2);
    setPercent("0%");
    setMessage(s.calculating);
    spawnHearts(22);

    if (timerRef.current) clearInterval(timerRef.current);
    let current = 0;
    const step = Math.max(1, Math.floor(score / 18));
    timerRef.current = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(timerRef.current);
        setPercent(current + "%");
        setMessage(getMessage(score, s));
        if (score >= 70) spawnHearts(12);
      } else {
        setPercent(current + "%");
      }
    }, 60);

    if (score < 5) {
      clearInterval(timerRef.current);
      setPercent(score + "%");
      setMessage(getMessage(score, s));
    }
  }

  return (
    <div className="relative">
      {/* floating hearts */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute"
            style={{
              left: h.left + "%",
              fontSize: h.size + "rem",
              animation: `floatUp ${h.duration}s linear ${h.delay}s forwards`,
              opacity: 0.8,
            }}
          >
            {h.emoji}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0.4) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(-20vh) scale(1.2) rotate(720deg); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* main card */}
      <div
        className="max-w-[520px] w-full mx-auto text-center rounded-[60px_60px_40px_40px] p-10 px-9 pb-11 border"
        style={{
          background: "rgba(26,10,30,0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,200,220,0.15)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
        }}
      >
        <div className="flex justify-center items-center gap-2.5 mb-1.5">
          <h1
            className="text-4xl font-bold"
            style={{
              background: "linear-gradient(135deg, #ff6b9d, #ff2d78, #ff6b9d)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s ease-in-out infinite",
              letterSpacing: "1px",
            }}
          >
            💖 {s.title}
          </h1>
        </div>
        <div
          className="mb-7 text-sm font-light"
          style={{ color: "rgba(255,220,240,0.6)", letterSpacing: "2px" }}
        >
          {s.subtitle}
        </div>

        {/* name inputs */}
        <div className="mb-[18px]">
          <label
            className="block text-sm font-medium mb-1.5 text-right"
            style={{ color: "rgba(255,220,240,0.8)" }}
          >
            {s.name1}
          </label>
          <input
            type="text"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
            placeholder={s.placeholder}
            maxLength={30}
            className="w-full px-5 py-3.5 rounded-[40px] text-base outline-none transition-all"
            style={{
              border: "1px solid rgba(255,150,200,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#ffe6f0",
              backdropFilter: "blur(4px)",
            }}
          />
        </div>
        <div className="mb-[18px]">
          <label
            className="block text-sm font-medium mb-1.5 text-right"
            style={{ color: "rgba(255,220,240,0.8)" }}
          >
            {s.name2}
          </label>
          <input
            type="text"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
            placeholder={s.placeholder}
            maxLength={30}
            className="w-full px-5 py-3.5 rounded-[40px] text-base outline-none transition-all"
            style={{
              border: "1px solid rgba(255,150,200,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#ffe6f0",
              backdropFilter: "blur(4px)",
            }}
          />
        </div>

        <Button
          onClick={calculate}
          className="w-full py-4 h-auto rounded-full text-lg font-bold my-2 mb-5 border-0"
          style={{
            color: "#1a0a1e",
            background: "linear-gradient(135deg, #ff6b9d, #ff2d78)",
            boxShadow: "0 8px 30px rgba(255,45,120,0.3)",
            letterSpacing: "1px",
          }}
        >
          {s.btn}
        </Button>

        {/* decorative heart bar */}
        <div
          className="flex justify-center gap-1.5 my-3 mb-1.5 text-2xl"
          style={{
            letterSpacing: "4px",
            opacity: 0.6,
            filter: "drop-shadow(0 0 6px rgba(255,80,140,0.3))",
          }}
        >
          {s.bar}
        </div>

        {/* result */}
        <div className="min-h-[110px] flex flex-col justify-center items-center py-2.5">
          <div
            className="text-[4.2rem] font-extrabold leading-tight"
            style={{
              background: "linear-gradient(135deg, #ffb3d1, #ff6b9d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {percent}
          </div>
          <div
            className="text-lg mt-1.5 font-normal min-h-[30px]"
            style={{ color: "rgba(255,220,240,0.85)" }}
          >
            {message}
          </div>
        </div>

        <div
          className="text-[0.65rem] mt-4"
          style={{ color: "rgba(255,200,220,0.2)", letterSpacing: "1px" }}
        >
          {s.footer}
        </div>
      </div>
    </div>
  );
}