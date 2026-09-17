import Marquee from "@/components/animata/container/marquee";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const images: { src: string; alt: string; className?: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=60",
    alt: "Luxury Estate 1",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60",
    alt: "Luxury Villa 2",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=60",
    alt: "Modern Residence 3",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&auto=format&fit=crop&q=60",
    alt: "Penthouse 4",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&auto=format&fit=crop&q=60",
    alt: "DHA Mansion 5",
  },
];

const placeholderChildren = (
  <Marquee className="absolute inset-0 [--gap:2px]" applyMask={false} pauseOnHover>
    {images.map((image, index) => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img key={`image_${index}`} src={image.src} alt={image.alt} className="object-cover h-full w-[240px]" />
    ))}
  </Marquee>
);

export default function ShapeShifter({
  prefix = "Shape",
  suffix = "Shifter",
  className,
  containerClassName,
  children,
}: {
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <Link
      to="/properties"
      className={cn(
        "text-xs sm:text-2xl md:text-3xl group/shifter inline-flex flex-row items-center justify-center gap-1 sm:gap-4 font-bold text-foreground transition-all cursor-pointer hover:opacity-95 text-center px-2",
        containerClassName,
      )}
    >
      <div className="text-center max-w-[75px] sm:max-w-none leading-tight">{prefix}</div>
      <div
        className={cn(
          "relative animate-[shape-shift] overflow-hidden bg-slate-950 dark:bg-zinc-900 p-0 transition-all ease-in-out direction-alternate repeat-infinite group-hover/shifter:[animation-play-state:paused] shadow-[0_0_30px_rgba(212,175,55,0.25)] border-y-2 border-[#D4AF37]/40 dark:border-y-white max-w-[70vw] sm:max-w-none shrink-0",
          className,
        )}
        style={{ animationDuration: "8s" }}
      >
        {children ?? placeholderChildren}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/shifter:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-amber-400 font-semibold text-xs sm:text-base tracking-wider drop-shadow-md">Explore →</span>
        </div>
      </div>
      <div className="text-center max-w-[85px] sm:max-w-none leading-tight">{suffix}</div>
    </Link>
  );
}
