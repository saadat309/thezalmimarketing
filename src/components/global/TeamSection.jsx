import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { motion } from "framer-motion";

const Reveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function TeamSection() {
  const team = [
    {
      name: "Ch. Sajid Mahmood",
      role: "CEO & Founder",
      specialist: "Investment Advisor & DHA Lahore Specialist",
      image: "/owner pic.jpg",
    },
    {
      name: "Abrar Hussain Imran",
      role: "Co-CEO",
      specialist: "CEO Zalmi Estate & Vice President DHA EAA",
      image: "/abrar.jpeg",
    },
    {
      name: "Waseem Khan",
      role: "Sales Executive",
      specialist: "DHA Phase 7 Specialist",
      image: "/waseem.jpeg",
    },
    {
      name: "Zeeshan Ahmed",
      role: "Sales Executive",
      specialist: "DHA 9 Prism Expert",
      image: "/zeeshan.jpeg",
    },
    {
      name: "Sohail Awan",
      role: "Sales Executive",
      specialist: "DHA Multan Specialist",
      image: "/sohail.jpeg",
    },
    {
      name: "Muhammad Azhar",
      role: "Sales Executive",
      specialist: "DHA Specialist",
      image: "/azhar.jpeg",
    },
    {
      name: "Ch Tariq",
      role: "Sales Executive",
      specialist: "DHA Islamabad Vally Specialist",
      image: "/tariq.jpeg",
    },
    {
      name: "Muhammad Usman",
      role: "Sales Executive",
      specialist: "DHA House Sale Purchase",
      image: "/usman.jpeg",
    },
    {
      name: "Muhammad Hammad",
      role: "Sales Executive",
      specialist: "DHA House Rent",
      image: "/hammad.jpeg",
    },
    {
      name: "Abdul Razaq",
      role: "Sales Executive",
      specialist: "DHA Phase 8 Specialist",
      image: "/abdul-razaq.jpeg",
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Meet Our Team</h2>
        <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
          The dedicated professionals behind our success, committed to delivering the best real estate experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map((member, index) => (
          <Reveal key={index} delay={index * 0.1} className="h-full">
            <Card className="flex flex-col h-full gap-0 p-0 overflow-hidden transition-all duration-300 border-0 bg-[var(--vintage-grape)] text-white hover:shadow-2xl group">
              <div className="relative overflow-hidden aspect-square bg-muted shrink-0">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground/30 bg-secondary/20">
                    <User className="w-24 h-24" />
                  </div>
                )}
              </div>
              <CardContent className="flex flex-col justify-center flex-grow p-6 text-center">
                <h3 className="text-lg font-bold text-white line-clamp-1">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-[var(--tea-green)]">{member.role}</p>
                <p className="mt-2 text-xs font-normal text-white/70">{member.specialist}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
