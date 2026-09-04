import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { mathEngine } from "@/lib/math-engine";
import {
  NumInput, TxtInput, SelectField, ResultCard, ResultCircle, InsightBox, TipBox, CalcButton,
} from "@/components/tools/ToolUI";
import {
  BasicKeypad, ScientificKeypad, FractionVisual, StatsVisual, GeometryVisual,
  ParabolaVisual, DivisorVisual, PermCombVisual,
} from "@/components/tools/MathVisuals";

function ErrorResult({ msg }) {
  return (
    <ResultCard title="⚠">
      <div className="text-sm text-destructive text-center">{msg}</div>
    </ResultCard>
  );
}

export default function MathTools({ slug }) {
  const { t } = useI18n();
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setInputs({}); setResult(null); setBusy(false); }, [slug]);

  const set = (k) => (e) => { setInputs((p) => ({ ...p, [k]: e.target.value })); setResult(null); };
  const press = (k) => { setInputs((p) => ({ ...p, expr: (p.expr || "") + k })); setResult(null); };
  const clearExpr = () => { setInputs((p) => ({ ...p, expr: "" })); setResult(null); };

  const runCalc = (compute) => {
    setBusy(true);
    setTimeout(() => {
      try { setResult(compute()); }
      catch (err) { setResult({ error: err.message }); }
      setBusy(false);
      setTimeout(() => document.querySelector('[data-tool-result="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    }, 800);
  };

  const res = (r, node) => {
    if (!r) return null;
    if (r.error) return <ErrorResult msg={r.error} />;
    return typeof node === "function" ? node() : node;
  };

  switch (slug) {
    case "basic-calculator": {
      const calc = () => {
        const expr = (inputs.expr || "").trim();
        if (!expr) return null;
        return { value: mathEngine("basic", { expression: expr }) };
      };
      const r = result;
      return (
        <>
          <TxtInput label={t("Expression")} value={inputs.expr} onChange={set("expr")} placeholder="2 + 3 * 4" />
          <p className="text-xs text-muted-foreground mt-2 ml-1">{t("Supports")} +, −, ×, ÷, ( )</p>
          <BasicKeypad expr={inputs.expr} onKey={press} onClear={clearExpr} onEquals={() => runCalc(calc)} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Result")}>
              <ResultCircle value={r.value} />
              <TipBox>{t("Order of operations (PEMDAS) applies: parentheses, then ×÷, then +−.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "scientific-calculator": {
      const calc = () => {
        const expr = (inputs.expr || "").trim();
        if (!expr) return null;
        return { value: mathEngine("scientific", { expression: expr }) };
      };
      const r = result;
      return (
        <>
          <TxtInput label={t("Expression")} value={inputs.expr} onChange={set("expr")} placeholder="sin(pi/2) + 2^3" />
          <p className="text-xs text-muted-foreground mt-2 ml-1">{t("Supports")} sin, cos, tan, sqrt, ln, log, ^, π, e</p>
          <ScientificKeypad expr={inputs.expr} onKey={press} onClear={clearExpr} onEquals={() => runCalc(calc)} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Result")}>
              <ResultCircle value={r.value} />
              <TipBox>{t("Use π for pi, e for Euler's number, ^ for powers, sqrt() for square root.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "fraction-calculator": {
      const calc = () => mathEngine("fraction", {
        a: inputs.a, b: inputs.b, c: inputs.c, d: inputs.d, op: inputs.op || "add",
      });
      const r = result;
      const opOpts = [
        { value: "add", label: t("Add") }, { value: "sub", label: t("Subtract") },
        { value: "mul", label: t("Multiply") }, { value: "div", label: t("Divide") },
      ];
      return (
        <>
          <SelectField label={t("Operation")} value={inputs.op || "add"} onChange={set("op")} options={opOpts} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <NumInput label={t("Numerator 1")} value={inputs.a} onChange={set("a")} placeholder="1" />
            <NumInput label={t("Denominator 1")} value={inputs.b} onChange={set("b")} placeholder="2" />
            <NumInput label={t("Numerator 2")} value={inputs.c} onChange={set("c")} placeholder="3" />
            <NumInput label={t("Denominator 2")} value={inputs.d} onChange={set("d")} placeholder="4" />
          </div>
          <FractionVisual a={inputs.a} b={inputs.b} c={inputs.c} d={inputs.d} op={inputs.op || "add"} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Result")}>
              <ResultCircle value={r.display} unit={t("Fraction")} sub={`= ${r.decimal}`} />
              <div className="mt-4 text-sm text-center text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Simplified")}: <strong className="text-primary">{r.display}</strong> · {t("Decimal")}: <strong className="text-accent">{r.decimal}</strong></div>
              <TipBox>{t("Results are automatically simplified to lowest terms.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "statistics-calculator": {
      const calc = () => {
        const nums = (inputs.numbers || "").trim();
        if (!nums) return null;
        return mathEngine("stats", { numbers: nums });
      };
      const r = result;
      const statRow = (label, val) => (
        <div className="flex items-center justify-between rounded-xl bg-background border border-border px-4 py-2.5">
          <span className="text-sm text-muted-foreground">{t(label)}</span>
          <span className="text-sm font-bold text-foreground tabular-nums">{val}</span>
        </div>
      );
      return (
        <>
          <TxtInput label={t("Numbers (comma-separated)")} value={inputs.numbers} onChange={set("numbers")} placeholder="5, 10, 15, 20, 25" />
          <StatsVisual numbers={inputs.numbers} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Statistics")}>
              <ResultCircle value={r.mean} unit={t("Mean")} sub={`${r.count} ${t("values")}`} />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {statRow("Sum", r.sum)}
                {statRow("Median", r.median)}
                {statRow("Mode", r.mode)}
                {statRow("Variance", r.variance)}
                {statRow("Std Dev", r.stdDev)}
                {statRow("Min", r.min)}
                {statRow("Max", r.max)}
              </div>
              <InsightBox>{t("Standard deviation measures how spread the values are from the mean.")}</InsightBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "geometry-calculator": {
      const typeOpts = [
        { value: "rect", label: t("Rectangle Area") },
        { value: "circle", label: t("Circle Area") },
        { value: "tri", label: t("Triangle Area") },
        { value: "cube", label: t("Rectangular Prism Volume") },
      ];
      const mode = inputs.type || "rect";
      const calc = () => mathEngine("geometry", { type: mode, a: inputs.a, b: inputs.b, c: inputs.c });
      const r = result;
      const needB = mode === "rect" || mode === "tri" || mode === "cube";
      const needC = mode === "cube";
      const ph = { rect: ["width", "height"], circle: ["radius", ""], tri: ["base", "height"], cube: ["length", "width"] };
      return (
        <>
          <SelectField label={t("Shape")} value={mode} onChange={set("type")} options={typeOpts} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <NumInput label={t("a")} value={inputs.a} onChange={set("a")} placeholder={ph[mode][0]} />
            {needB && <NumInput label={t("b")} value={inputs.b} onChange={set("b")} placeholder={ph[mode][1]} />}
            {needC && <NumInput label={t("c")} value={inputs.c} onChange={set("c")} placeholder="depth" />}
          </div>
          <GeometryVisual type={mode} a={inputs.a} b={inputs.b} c={inputs.c} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t(r.label)}>
              <ResultCircle value={r.value} />
              <TipBox>{t("Circle area uses π × r². Triangle area uses ½ × base × height.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "quadratic-solver": {
      const calc = () => {
        if (!inputs.a && inputs.a !== "0") return null;
        return mathEngine("quadratic", { a: inputs.a, b: inputs.b, c: inputs.c });
      };
      const r = result;
      const rootsLabel = r ? (
        r.type === "complex" ? `${t("Complex roots")}: ${r.display}` :
        r.type === "double" ? `${t("Double root")}: x = ${r.roots[0]}` :
        `${t("Two real roots")}: x₁ = ${r.roots[0]}, x₂ = ${r.roots[1]}`
      ) : "";
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumInput label="a" value={inputs.a} onChange={set("a")} placeholder="1" />
            <NumInput label="b" value={inputs.b} onChange={set("b")} placeholder="-3" />
            <NumInput label="c" value={inputs.c} onChange={set("c")} placeholder="2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">{t("Solves")} ax² + bx + c = 0</p>
          <ParabolaVisual a={inputs.a} b={inputs.b} c={inputs.c} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Solve")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Solution")}>
              <div className="text-center text-lg font-bold text-foreground break-words">{rootsLabel}</div>
              <div className="mt-4 text-sm text-center text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Discriminant")}: <strong className="text-accent">{r.discriminant}</strong></div>
              <TipBox>{t("The discriminant (b²−4ac) determines the root type: positive → two real, zero → one, negative → complex.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "gcd-lcm-calculator": {
      const calc = () => {
        const nums = (inputs.numbers || "").trim();
        if (!nums) return null;
        return mathEngine("gcd_lcm", { numbers: nums });
      };
      const r = result;
      return (
        <>
          <TxtInput label={t("Numbers (comma-separated)")} value={inputs.numbers} onChange={set("numbers")} placeholder="12, 18, 24" />
          <DivisorVisual numbers={inputs.numbers} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Result")}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-background border border-border p-5 text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("GCD")}</div>
                  <div className="text-3xl font-extrabold text-primary">{r.gcd}</div>
                </div>
                <div className="rounded-2xl bg-background border border-border p-5 text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("LCM")}</div>
                  <div className="text-3xl font-extrabold text-accent">{r.lcm}</div>
                </div>
              </div>
              <TipBox>{t("GCD = greatest common divisor. LCM = least common multiple. Both require integers.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "perm-comb-calculator": {
      const calc = () => {
        if (!inputs.n && inputs.n !== "0") return null;
        return mathEngine("perm_comb", { n: inputs.n, r: inputs.r });
      };
      const r = result;
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumInput label="n" value={inputs.n} onChange={set("n")} placeholder="5" />
            <NumInput label="r" value={inputs.r} onChange={set("r")} placeholder="2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">{t("nPr = ordered arrangements · nCr = unordered selections")}</p>
          <PermCombVisual n={inputs.n} r={inputs.r} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Result")}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-background border border-border p-5 text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("Permutations (nPr)")}</div>
                  <div className="text-3xl font-extrabold text-primary">{r.nPr}</div>
                </div>
                <div className="rounded-2xl bg-background border border-border p-5 text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("Combinations (nCr)")}</div>
                  <div className="text-3xl font-extrabold text-accent">{r.nCr}</div>
                </div>
              </div>
              <TipBox>{t("nPr counts order, nCr does not. Both require n ≥ r ≥ 0.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    case "matrix-calculator": {
      const opOpts = [
        { value: "add", label: t("Add") }, { value: "sub", label: t("Subtract") },
        { value: "mul", label: t("Multiply") }, { value: "det", label: t("Determinant") },
      ];
      const mode = inputs.op || "add";
      const calc = () => mathEngine("matrix", {
        m1: { a11: inputs.a11, a12: inputs.a12, a21: inputs.a21, a22: inputs.a22 },
        m2: { a11: inputs.b11, a12: inputs.b12, a21: inputs.b21, a22: inputs.b22 },
        op: mode,
      });
      const r = result;
      const mCell = (label, key) => (
        <NumInput label={label} value={inputs[key]} onChange={set(key)} placeholder="0" />
      );
      const mat = (p, keys) => (
        <div className="rounded-2xl bg-background border border-border p-3">
          <div className="text-xs font-bold text-muted-foreground mb-2 text-center">{p}</div>
          <div className="grid grid-cols-2 gap-2">
            {mCell("a11", keys[0])}
            {mCell("a12", keys[1])}
            {mCell("a21", keys[2])}
            {mCell("a22", keys[3])}
          </div>
        </div>
      );
      const showSecond = mode !== "det";
      return (
        <>
          <SelectField label={t("Operation")} value={mode} onChange={set("op")} options={opOpts} />
          <div className={`grid ${showSecond ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-3 mt-3`}>
            {mat("Matrix A", ["a11", "a12", "a21", "a22"])}
            {showSecond && mat("Matrix B", ["b11", "b12", "b21", "b22"])}
          </div>
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Result")}>
              {r.type === "determinant" ? (
                <ResultCircle value={r.value} unit={t("Determinant")} />
              ) : (
                <div className="rounded-2xl bg-background border border-border p-4">
                  <div className="text-xs font-bold text-muted-foreground mb-3 text-center">{t("Result Matrix")}</div>
                  <div className="grid grid-cols-2 gap-2 max-w-[240px] mx-auto">
                    {["a11","a12","a21","a22"].map((k) => (
                      <div key={k} className="rounded-lg bg-card border border-border py-3 text-center font-bold text-foreground tabular-nums">{r.result[k]}</div>
                    ))}
                  </div>
                </div>
              )}
              <TipBox>{t("Determinant of a 2×2 matrix = a11·a22 − a12·a21.")}</TipBox>
            </ResultCard>
          ))}
        </>
      );
    }
    default:
      return null;
  }
}