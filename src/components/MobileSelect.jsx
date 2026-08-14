import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChevronDown, Check } from "lucide-react";

// A Select that uses the Radix popover on desktop and a Vaul bottom-sheet
// Drawer on mobile. `options` may be strings or { value, label } objects.
export default function MobileSelect({ value, onChange, options, triggerClassName, placeholder, leading }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const selected = opts.find((o) => String(o.value) === String(value));
  const label = selected ? selected.label : placeholder ?? opts[0]?.label ?? "";

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={triggerClassName}>
          {leading}
          <SelectValue placeholder={placeholder ?? opts[0]?.label} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {opts.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button type="button" className={triggerClassName}>
          {leading}
          <span className="flex-1 text-left truncate">{label}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[75vh]">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="text-base font-semibold">{placeholder ?? "Select"}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-3 pb-6 max-h-[60vh] space-y-1">
          {opts.map((o) => {
            const active = String(o.value) === String(value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex items-center justify-between w-full rounded-xl px-4 py-3.5 text-left text-base min-h-[52px] transition-colors ${active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-secondary text-foreground"}`}
              >
                <span>{o.label}</span>
                {active && <Check className="w-5 h-5 text-primary" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}