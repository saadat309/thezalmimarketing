import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Award, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import content from "@/content/components/team.json";

const Reveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function TeamSection({ excludeNames = [] }) {
  const team = content.team.filter(member => !excludeNames.includes(member.name));

  return (
    <section className="relative py-24 overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Decorative background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F5A623]/5 dark:bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
              {content.badge}
            </Badge>
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl font-display text-foreground">
            <span>{content.headingPre}</span>
            <span className="gold-text-gradient">{content.headingHighlight}</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed font-light">
            {content.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member, index) => (
            <Reveal key={index} delay={index * 0.06} className="h-full">
              <Card className="flex flex-col h-full gap-0 p-0 overflow-hidden transition-all duration-500 bg-card border border-border hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-[#F5A623]/10 dark:hover:shadow-[#D4AF37]/10 group rounded-3xl">
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-square bg-muted shrink-0">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="object-cover object-top w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted">
                      <User className="w-24 h-24" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <CardContent className="flex flex-col justify-center flex-grow p-6 text-center space-y-2">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1 font-display group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors">{member.name}</h3>
                  <p className="text-xs font-semibold text-[#F5A623] dark:text-[#D4AF37] uppercase tracking-widest">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light pt-1">{member.specialist}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
