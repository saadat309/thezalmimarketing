import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Sparkles, HelpCircle, ChevronRight, ArrowLeft, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { DHA_QUESTIONS } from "@/data/dhaQuestionsData";

export default function DhaQuestionsAutoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [randomQuestions, setRandomQuestions] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check session storage
    if (sessionStorage.getItem("dha_questions_auto_shown") === "1") {
      return;
    }

    // Pick 2 random high-value questions for this visit
    const shuffled = [...DHA_QUESTIONS].sort(() => 0.5 - Math.random());
    setRandomQuestions(shuffled.slice(0, 2));

    // Randomized threshold between 100vh and 200vh
    const minHeight = window.innerHeight;
    const maxHeight = window.innerHeight * 2;
    const scrollThreshold = Math.floor(minHeight + Math.random() * (maxHeight - minHeight));

    let hasTriggered = false;

    const handleScroll = () => {
      if (hasTriggered) return;
      if (window.scrollY >= scrollThreshold) {
        // Check if existing dashboard popup is currently open
        const existingDialog = document.querySelector('[role="dialog"]');
        if (existingDialog) {
          // Dashboard popup is open -> wait and check again shortly
          return;
        }

        hasTriggered = true;
        setIsOpen(true);
        sessionStorage.setItem("dha_questions_auto_shown", "1");
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // WhatsApp configuration
  const whatsappNumber = "923218446496";
  const getWhatsAppUrl = (questionText = "") => {
    const msg = questionText
      ? `Hi, I was exploring The Zalmi Marketing website. My question is: "${questionText}"`
      : "Hi, I want expert advice on DHA Lahore properties.";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-[#F5A623]/30 dark:border-[#D4AF37]/30 shadow-2xl p-4 sm:p-6" data-lenis-prevent>
        
        {/* Header */}
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D4AF37] flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F5A623] dark:text-[#D4AF37]">
              DHA Property Quick Guide
            </span>
          </div>
          
          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {activeQuestion ? activeQuestion.question : "Have a question about DHA Lahore?"}
          </DialogTitle>
          
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {activeQuestion 
              ? "Instant expert insight from The Zalmi Marketing team." 
              : "Tap a question below to instantly see what buyers and investors need to know."}
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="mt-4 space-y-4">
          {activeQuestion ? (
            /* Answer State */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs sm:text-sm text-foreground leading-relaxed">
                {activeQuestion.answer}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveQuestion(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Other questions
                </button>

                <a
                  href={getWhatsAppUrl(activeQuestion.question)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.25)] transition-all"
                >
                  <FaWhatsapp className="w-4 h-4" /> Talk to a DHA Property Expert
                </a>
              </div>
            </div>
          ) : (
            /* Question Choices State (1-2 questions) */
            <div className="space-y-3 animate-in fade-in duration-300">
              {randomQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestion(q)}
                  className="w-full group flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-[#F5A623]/60 hover:shadow-md transition-all text-left"
                >
                  <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-[#F5A623] transition-colors pr-2">
                    {q.question}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-[#F5A623] group-hover:text-slate-950 transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Need personalized advice?</span>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <FaWhatsapp className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
