import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  NumInput, TxtInput, SelectField, ResultCard, ResultCircle, InsightBox, TipBox, CalcButton,
} from "@/components/tools/ToolUI";
import {
  calculateCalories, calculateIdealWeight, calculateBodyFat,
  calculateProtein, calculateCarbs, calculateFat, calculatePace, calculateBmr, calculateTdee,
} from "@/lib/health-engine";
import {
  IdealWeightVisual, BodyFatVisual, ProteinVisual, CarbsVisual, FatVisual,
  PaceVisual, BmrVisual, TdeeVisual, CalorieVisual,
} from "@/components/tools/HealthVisuals";

function ErrorResult({ msg }) {
  return (
    <ResultCard title="⚠">
      <div className="text-sm text-destructive text-center">{msg}</div>
    </ResultCard>
  );
}

export default function HealthTools({ slug }) {
  const { t } = useI18n();
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setInputs({}); setResult(null); setBusy(false); }, [slug]);

  const set = (k) => (e) => { setInputs((p) => ({ ...p, [k]: e.target.value })); setResult(null); };

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

  const genderOpts = [{ value: "male", label: t("Male") }, { value: "female", label: t("Female") }];
  const activityOpts = [
    { value: "sedentary", label: t("Sedentary") },
    { value: "light", label: t("Lightly Active") },
    { value: "moderate", label: t("Moderately Active") },
    { value: "active", label: t("Very Active") },
    { value: "very_active", label: t("Extra Active") },
  ];
  const proteinActivityOpts = [
    { value: "sedentary", label: t("Sedentary") },
    { value: "active", label: t("Active") },
    { value: "athlete", label: t("Athlete") },
  ];
  const goalOpts = [
    { value: "maintain", label: t("Maintain") },
    { value: "build_muscle", label: t("Build Muscle") },
    { value: "lose_fat", label: t("Lose Fat") },
  ];

  switch (slug) {
    case "ideal-weight": {
      const calc = () => calculateIdealWeight({ gender: inputs.gender, height: inputs.height });
      const r = result;
      return (
        <>
          <SelectField label={t("Gender")} value={inputs.gender || "male"} onChange={set("gender")} options={genderOpts} />
          <NumInput label={t("Height (cm)")} value={inputs.height} onChange={set("height")} placeholder="175" />
          <IdealWeightVisual gender={inputs.gender} height={inputs.height} weight={inputs.weight} />
          <NumInput label={t("Your Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Ideal Weight")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Ideal Weight")}>
              <ResultCircle value={r.ideal} unit={t("kg")} sub={t("Devine formula")} />
              <div className="mt-4 text-sm text-center text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Healthy Range")}: <strong className="text-emerald-600">{r.low}–{r.high} kg</strong></div>
              <InsightBox>{t("Ideal weight is an estimate based on height and gender. Muscle mass and body composition matter more than a single number.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("The Devine formula gives a healthy target — pair it with BMI and body-fat for a fuller picture.")}</TipBox>
        </>
      );
    }
    case "body-fat": {
      const calc = () => calculateBodyFat({
        gender: inputs.gender, age: inputs.age, weight: inputs.weight,
        height: inputs.height, waist: inputs.waist, neck: inputs.neck, hip: inputs.hip,
      });
      const r = result;
      const isF = (inputs.gender || "male") === "female";
      return (
        <>
          <SelectField label={t("Gender")} value={inputs.gender || "male"} onChange={set("gender")} options={genderOpts} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <NumInput label={t("Age")} value={inputs.age} onChange={set("age")} placeholder="30" />
            <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
            <NumInput label={t("Height (cm)")} value={inputs.height} onChange={set("height")} placeholder="175" />
            <NumInput label={t("Waist (cm)")} value={inputs.waist} onChange={set("waist")} placeholder="80" />
            <NumInput label={t("Neck (cm)")} value={inputs.neck} onChange={set("neck")} placeholder="38" />
            {isF && <NumInput label={t("Hip (cm)")} value={inputs.hip} onChange={set("hip")} placeholder="95" />}
          </div>
          <BodyFatVisual gender={inputs.gender} age={inputs.age} weight={inputs.weight} height={inputs.height} waist={inputs.waist} neck={inputs.neck} hip={inputs.hip} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Body Fat")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Body Fat %")}>
              <ResultCircle value={`${r.bodyFat}%`} unit={t(r.category)} />
              <InsightBox>{t("US Navy method uses circumference measurements. For accuracy, measure in the morning before eating.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("Measure waist at the navel, neck below the larynx, and hip at the widest point for consistent results.")}</TipBox>
        </>
      );
    }
    case "daily-protein": {
      const calc = () => calculateProtein({ weight: inputs.weight, activity: inputs.activity, goal: inputs.goal });
      const r = result;
      return (
        <>
          <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
          <SelectField label={t("Activity Level")} value={inputs.activity || "sedentary"} onChange={set("activity")} options={proteinActivityOpts} />
          <SelectField label={t("Goal")} value={inputs.goal || "maintain"} onChange={set("goal")} options={goalOpts} />
          <ProteinVisual weight={inputs.weight} activity={inputs.activity} goal={inputs.goal} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Protein")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Daily Protein")}>
              <ResultCircle value={r.protein} unit={t("grams/day")} sub={`${r.factor} g/kg`} />
              <div className="mt-4 text-sm text-center text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Range")}: <strong className="text-emerald-600">{r.low}–{r.high} g</strong></div>
              <InsightBox>{t("Protein needs rise with training intensity. Spread intake across meals for better absorption.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("Endurance athletes need 1.2–1.6 g/kg; strength athletes 1.6–2.2 g/kg.")}</TipBox>
        </>
      );
    }
    case "daily-carbs": {
      const calc = () => calculateCarbs({ calories: inputs.calories, percent: inputs.percent });
      const r = result;
      return (
        <>
          <NumInput label={t("Total Daily Calories")} value={inputs.calories} onChange={set("calories")} placeholder="2000" />
          <NumInput label={t("Carb Percent (%)")} value={inputs.percent} onChange={set("percent")} placeholder="45" />
          <CarbsVisual calories={inputs.calories} percent={inputs.percent} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Carbs")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Daily Carbs")}>
              <ResultCircle value={r.grams} unit={t("grams/day")} sub={`${r.percent}% of calories`} />
              <InsightBox>{t("1 g of carbs = 4 calories. The 45–65% range suits most people.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("Athletes may benefit from higher carb intake (55–65%) to fuel training.")}</TipBox>
        </>
      );
    }
    case "daily-fat": {
      const calc = () => calculateFat({ calories: inputs.calories, percent: inputs.percent });
      const r = result;
      return (
        <>
          <NumInput label={t("Total Daily Calories")} value={inputs.calories} onChange={set("calories")} placeholder="2000" />
          <NumInput label={t("Fat Percent (%)")} value={inputs.percent} onChange={set("percent")} placeholder="30" />
          <FatVisual calories={inputs.calories} percent={inputs.percent} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Fat")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Daily Fat")}>
              <ResultCircle value={r.grams} unit={t("grams/day")} sub={`${r.percent}% of calories`} />
              <InsightBox>{t("1 g of fat = 9 calories. Keep fat between 20–35% of total calories.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("Prioritize unsaturated fats (olive oil, nuts, fish) over saturated and trans fats.")}</TipBox>
        </>
      );
    }
    case "running-pace": {
      const calc = () => calculatePace({ distance: inputs.distance, time: inputs.time });
      const r = result;
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumInput label={t("Distance (km)")} value={inputs.distance} onChange={set("distance")} placeholder="10" />
            <NumInput label={t("Time (min)")} value={inputs.time} onChange={set("time")} placeholder="50" />
          </div>
          <PaceVisual distance={inputs.distance} time={inputs.time} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Pace")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Running Pace")}>
              <ResultCircle value={r.pace} unit={t("min/km")} sub={`${r.speed} km/h`} />
              <InsightBox>{t("Pace = time ÷ distance. A lower pace means you cover each km faster.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("To set a race goal, target a pace and multiply by the distance to find your finish time.")}</TipBox>
        </>
      );
    }
    case "bmr-calculator": {
      const calc = () => calculateBmr({ age: inputs.age, gender: inputs.gender, height: inputs.height, weight: inputs.weight });
      const r = result;
      return (
        <>
          <SelectField label={t("Gender")} value={inputs.gender || "male"} onChange={set("gender")} options={genderOpts} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <NumInput label={t("Age")} value={inputs.age} onChange={set("age")} placeholder="30" />
            <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
            <NumInput label={t("Height (cm)")} value={inputs.height} onChange={set("height")} placeholder="175" />
          </div>
          <BmrVisual age={inputs.age} gender={inputs.gender} height={inputs.height} weight={inputs.weight} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate BMR")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("BMR")}>
              <ResultCircle value={r.bmr} unit={t("kcal/day")} sub={t("Mifflin-St Jeor")} />
              <InsightBox>{t("BMR is the energy your body uses at complete rest to keep vital functions running.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("BMR is the foundation — multiply by your activity factor to get daily needs (TDEE).")}</TipBox>
        </>
      );
    }
    case "tdee-calculator": {
      const calc = () => calculateTdee({ age: inputs.age, gender: inputs.gender, height: inputs.height, weight: inputs.weight, activity: inputs.activity });
      const r = result;
      return (
        <>
          <SelectField label={t("Gender")} value={inputs.gender || "male"} onChange={set("gender")} options={genderOpts} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <NumInput label={t("Age")} value={inputs.age} onChange={set("age")} placeholder="30" />
            <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
            <NumInput label={t("Height (cm)")} value={inputs.height} onChange={set("height")} placeholder="175" />
          </div>
          <SelectField label={t("Activity Level")} value={inputs.activity || "sedentary"} onChange={set("activity")} options={activityOpts} />
          <TdeeVisual age={inputs.age} gender={inputs.gender} height={inputs.height} weight={inputs.weight} activity={inputs.activity} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate TDEE")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("TDEE")}>
              <ResultCircle value={r.tdee} unit={t("kcal/day")} sub={`BMR ${r.bmr} × ${r.factor}`} />
              <InsightBox>{t("TDEE = BMR × activity factor. Eat below it to lose weight, above it to gain.")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("A 500 kcal/day deficit gives roughly 0.5 kg loss per week.")}</TipBox>
        </>
      );
    }
    case "calorie-calculator": {
      const calc = () => calculateCalories({ age: inputs.age, gender: inputs.gender, height: inputs.height, weight: inputs.weight, activity: inputs.activity });
      const r = result;
      return (
        <>
          <SelectField label={t("Gender")} value={inputs.gender || "male"} onChange={set("gender")} options={genderOpts} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <NumInput label={t("Age")} value={inputs.age} onChange={set("age")} placeholder="30" />
            <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
            <NumInput label={t("Height (cm)")} value={inputs.height} onChange={set("height")} placeholder="175" />
          </div>
          <SelectField label={t("Activity Level")} value={inputs.activity || "sedentary"} onChange={set("activity")} options={activityOpts} />
          <CalorieVisual age={inputs.age} gender={inputs.gender} height={inputs.height} weight={inputs.weight} activity={inputs.activity} />
          <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Calculating...")}>{t("Calculate Calories")}</CalcButton></div>
          {res(r, () => (
            <ResultCard title={t("Daily Calorie Needs")}>
              <ResultCircle value={r.maintenance} unit={t("kcal/day")} sub={t("Maintenance")} />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-background border border-border px-3 py-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Loss")}</div>
                  <div className="text-base font-bold text-blue-500">{r.loss}</div>
                </div>
                <div className="rounded-xl bg-background border border-border px-3 py-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Maintenance")}</div>
                  <div className="text-base font-bold text-emerald-500">{r.maintenance}</div>
                </div>
                <div className="rounded-xl bg-background border border-border px-3 py-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Gain")}</div>
                  <div className="text-base font-bold text-amber-500">{r.gain}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-center text-muted-foreground">{t("BMR")}: {r.bmr} · {t("TDEE")}: {r.tdee}</div>
              <InsightBox>{t("Maintenance = TDEE. Subtract 500 for weight loss, add 500 for gain (~0.5 kg/week).")}</InsightBox>
            </ResultCard>
          ))}
          <TipBox>{t("Track intake for a week to see how it matches your calculated needs.")}</TipBox>
        </>
      );
    }
    default:
      return null;
  }
}