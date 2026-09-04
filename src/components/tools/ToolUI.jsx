import { Button } from "@/components/ui/button";
import MobileSelect from "@/components/MobileSelect";
import { RefreshCw, ShieldCheck } from "lucide-react";

export function NumInput({ label, value, onChange, placeholder }) {
  return (
    <div className="text-left">
      <label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{label}</label>
      <input type="number" inputMode="decimal" value={value ?? ""} onChange={onChange} placeholder={placeholder}
      className="w-full border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 dark:placeholder:text-[#6B6B8A] text-base px-4 h-[52px] transition-all duration-200 focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)] rounded-2xl opacity-80" />
    </div>);

}
export function TxtInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="text-left">
      <label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{label}</label>
      <input type={type} inputMode={type === "number" ? "decimal" : undefined} value={value ?? ""} onChange={onChange} placeholder={placeholder}
      className="w-full rounded-[16px] border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 dark:placeholder:text-[#6B6B8A] text-base px-4 h-[52px] transition-all duration-200 focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]" />
    </div>);

}
export function FnInput({ label, value, onChange, placeholder }) {
  return (
    <div className="text-left">
      <label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{label}</label>
      <textarea value={value ?? ""} onChange={onChange} placeholder={placeholder} rows={3}
      className="w-full rounded-[16px] border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 dark:placeholder:text-[#6B6B8A] text-base px-4 h-[52px] transition-all duration-200 resize-y font-mono focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]" />
    </div>);

}
export function SelectField({ label, value, onChange, options }) {
  return (
    <div className="text-left">
      <label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{label}</label>
      <MobileSelect
        value={value}
        onChange={(v) => onChange({ target: { value: v } })}
        options={options}
        placeholder={options[0]}
        triggerClassName="w-full flex items-center gap-2 rounded-[16px] border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] text-base px-4 h-[52px] focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]" />
      
    </div>);

}
export function RangeField({ label, value, onChange, min, max, step = 1 }) {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-1.5 ml-1">
        <label className="block text-sm font-medium text-[#92400E] dark:text-[#FBBF24]">{label}</label>
        <span className="text-xs font-bold text-primary tabular-nums">{value ?? min}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value ?? min} onChange={onChange}
      className="w-full h-10 accent-[#F59E0B] cursor-pointer" />
    </div>);

}
export function ResultCard({ title, children }) {
  return (
    <div data-tool-result="true" className="mt-8 rounded-[16px] p-6 animate-[slideDown_0.3s_ease-out] bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] shadow-sm transition-colors duration-300" style={{ backgroundImage: "radial-gradient(hsl(45 96% 50% / 0.18) 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }}>
      <h4 className="text-lg font-bold text-[#1E1B4B] dark:text-[#FEF3C7] mb-4 text-center">{title}</h4>
      <div className="text-center">{children}</div>
    </div>);

}
export function ResultCircle({ value, unit, sub }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-32 h-32 rounded-full border-4 border-[#F59E0B] bg-gradient-to-br from-[#6D28D9]/20 to-[#F59E0B]/20 flex items-center justify-center relative">
        <div className="absolute inset-2 rounded-full bg-white dark:bg-[#1E1B4B]"></div>
        <span className="relative text-4xl font-black text-[#1E1B4B] dark:text-[#FEF3C7] leading-none">{value}</span>
      </div>
      {unit && <div className="text-sm font-semibold text-[#6D28D9] -mt-1">{unit}</div>}
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>);

}
export function InsightBox({ children, icon: Icon = ShieldCheck }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/70 dark:bg-[#1E1B4B]/70 border border-[#FDE68A] dark:border-[#4B3F8A] p-4 text-left transition-colors duration-300">
      <span className="shrink-0 text-[#F59E0B] mt-0.5"><Icon className="w-5 h-5" /></span>
      <span className="text-sm text-[#1E1B4B] dark:text-[#FEF3C7] leading-relaxed">{children}</span>
    </div>);

}
export function TipBox({ children }) {
  return <div className="mt-6 rounded-2xl bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-5 text-sm text-[#1E1B4B] dark:text-[#FEF3C7] text-center shadow-[inset_0_2px_6px_hsl(0_0%_0%/0.05)] transition-colors duration-300">{children}</div>;
}
export function CalcButton({ children, onClick, busy = false, busyLabel, variant = "primary" }) {
  return (
    <Button onClick={onClick} disabled={busy}
    className={`relative overflow-hidden mt-6 w-full sm:w-auto rounded-full px-8 h-14 font-bold text-base transition-all duration-200 disabled:opacity-90 disabled:cursor-wait ${variant === "primary" ? "bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] border-2 border-[#F59E0B] text-white shadow-[0_12px_24px_-6px_rgba(109,40,217,0.4)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-6px_rgba(109,40,217,0.55)] active:translate-y-0" : "bg-[#FFFBEB] border-2 border-[#FDE68A] text-[#1E1B4B] hover:border-[#F59E0B]"}`}>
      {variant === "primary" && !busy && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />}
      {busy ?
      <span className="relative z-10 flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> {busyLabel || children}</span> :

      <span className="relative z-10">{children}</span>
      }
    </Button>);

}