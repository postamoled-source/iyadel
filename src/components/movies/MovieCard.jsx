import { Link } from "react-router-dom";
import { Star, Film, Tv } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function MovieCard({ item, lang }) {
  const isCustom = item.isCustom;
  const to = `/movies/${item.media_type}/${item.id}`;
  const TypeIcon = item.media_type === "tv" ? Tv : Film;

  return (
    <Link
      to={to}
      className="group block bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(109,40,217,0.08)] hover:-translate-y-1 hover:shadow-lg transition-all"
    >
      <div className="relative aspect-[2/3] bg-[#F3F4F6] dark:bg-[#1E1B4B] overflow-hidden">
        {item.poster ? (
          <Image src={item.poster} alt={item.title} className="w-full h-full" fittingType="fill" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D28D9] to-[#F59E0B]">
            <TypeIcon className="w-10 h-10 text-white/80" />
          </div>
        )}
        {item.rating > 0 && (
          <span className="absolute top-2 end-2 inline-flex items-center gap-1 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
            {item.rating.toFixed(1)}
          </span>
        )}
        {isCustom && (
          <span className="absolute top-2 start-2 bg-[#6D28D9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {lang === "ar" ? "مضاف" : "Added"}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#FEF3C7] leading-snug line-clamp-2 min-h-[2.5rem]">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-[#6B7280] dark:text-[#A8A6C4]">
          <span className="inline-flex items-center gap-1">
            <TypeIcon className="w-3 h-3" />
            {item.media_type === "tv" ? (lang === "ar" ? "مسلسل" : "Series") : (lang === "ar" ? "فيلم" : "Movie")}
          </span>
          {item.year && <span>• {item.year}</span>}
        </div>
      </div>
    </Link>
  );
}