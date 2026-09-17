import ShapeShifter from "@/components/animata/hero/shape-shifter";

export default function ShapeShifterSection() {
  return (
    <section className="relative w-full h-[260px] sm:h-[400px] overflow-hidden flex items-center justify-center bg-transparent px-2 sm:px-0">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-center">
        <ShapeShifter
          prefix="Explore"
          suffix="Elite Estates"
          className="h-[130px] sm:h-[375px] border-0 shadow-2xl"
          containerClassName="bg-transparent border-0 shadow-none justify-center items-center w-full max-w-6xl mx-auto text-foreground"
        />
      </div>
    </section>
  );
}
