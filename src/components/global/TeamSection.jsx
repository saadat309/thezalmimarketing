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
      image: "/owner pic.jpg",
      bio: "Leading The Zalmi Marketing with a vision of trust and excellence since 2020.",
    },
    {
      name: "Abrar Hussain Imran",
      role: "Co-CEO",
      image: "/staff-1.jpg",
      bio: "Driving strategic growth and operational excellence across all departments.",
    },
    {
      name: "Waseem Khan",
      role: "Sales Executive",
      image: "/staff-2.jpg",
      bio: "Expert in client relations and finding the perfect property matches.",
    },
    {
      name: "Zeeshan Ahmed",
      role: "Sales Executive",
      image: "/staff-1.jpg",
      bio: "Dedicated to providing transparent and professional real estate services.",
    },
    {
      name: "Sohail Awan",
      role: "Sales Executive",
      image: "/staff-2.jpg",
      bio: "Committed to delivering exceptional value and support to our clients.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Meet Our Team</h2>
        <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
          The dedicated professionals behind our success, committed to delivering the best real estate experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {team.map((member, index) => (
          <Reveal key={index} delay={index * 0.1} className="h-full">
            <Card className="h-full overflow-hidden transition-all duration-300 border-0 hover:shadow-lg group">
              <div className="relative overflow-hidden aspect-[4/5] bg-muted">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground/30 bg-secondary/20">
                    <User className="w-24 h-24" />
                  </div>
                )}
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-sm font-medium text-white/90">{member.bio}</p>
                </div>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-foreground line-clamp-1">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
