import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaHandshake, FaShieldAlt, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import content from "@/content/components/why-us.json";

const iconMap = [FaHandshake, FaShieldAlt, FaChartLine];

const Reveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function WhyUs() {
  const data = content.whyUs;
  const features = data.features.map((f, i) => ({
    ...f,
    icon: iconMap[i] || FaHandshake,
  }));

  return (
    <section className="py-24 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#F5A623]/5 dark:bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-block mb-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
            {data.badge}
          </Badge>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl font-display text-foreground">
          <span>{data.headingPre}</span>
          <span className="gold-text-gradient">{data.headingHighlight}</span>
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
          {data.subheading}
        </p>

        <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-3">
          {features.map((feature, idx) => (
            <Reveal key={idx} delay={idx * 0.1} className="h-full">
              <div className="relative overflow-hidden rounded-3xl group transition-all duration-500 hover:-translate-y-2 h-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F5A623]/10 to-[#D4AF37]/5 opacity-40 group-hover:opacity-100 transition-opacity" />
                <Card className="relative z-10 p-8 sm:p-10 bg-card border border-border group-hover:border-[#F5A623]/50 dark:group-hover:border-[#D4AF37]/50 rounded-3xl shadow-xl h-full flex flex-col items-center text-center transition-all duration-300">
                  <div className="p-4 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-[#F5A623] dark:text-[#D4AF37] mb-6 group-hover:scale-110 group-hover:bg-[#F5A623] dark:group-hover:bg-[#D4AF37] group-hover:!text-slate-950 dark:group-hover:!text-slate-950 transition-all duration-300 shadow-inner">
                    <feature.icon size={32} />
                  </div>
                  <h4 className="text-xl font-bold font-display text-foreground mb-3">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {feature.description}
                  </p>
                </Card>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
