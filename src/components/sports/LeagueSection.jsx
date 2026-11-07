import { Image } from "@/components/ui/image";
import MatchRow from "./MatchRow";

export default function LeagueSection({ section, lang }) {
  const title = lang === "ar" ? section.name_ar || section.name : section.name;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#F3F4F6] bg-white shadow-[0_4px_12px_rgba(109,40,217,0.08)] dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
      <header className="flex items-center gap-2 border-b border-[#F3F4F6] bg-[#FAFAFF] px-3 py-2 dark:border-[#4B3F8A] dark:bg-[#252153]">
        {section.logo && (
          <Image
            src={section.logo}
            alt={title}
            fittingType="fit"
            className="h-5 w-5 shrink-0 object-contain"
          />
        )}
        <h3 dir="auto" className="flex-1 truncate text-[12px] font-bold text-[#111827] dark:text-[#FEF3C7]">
          {title}
        </h3>
        <span className="rounded-full bg-[#6D28D9]/10 px-2 py-0.5 text-[10px] font-bold text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#C4B5FD]">
          {section.matches.length}
        </span>
      </header>
      <div className="divide-y divide-[#F3F4F6] dark:divide-[#4B3F8A]">
        {section.matches.map((match) => (
          <MatchRow key={match.id} match={match} lang={lang} />
        ))}
      </div>
    </section>
  );
}