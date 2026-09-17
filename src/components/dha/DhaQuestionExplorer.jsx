import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, TrendingUp, Wallet, MapPin, Home, Tag, Globe, Users, 
  HelpCircle, ChevronRight, ArrowLeft, MessageSquare, Send, X, CheckCircle2, Flame
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { DHA_CATEGORIES, HOOK_ROTATING_QUESTIONS, DHA_QUESTIONS } from "@/data/dhaQuestionsData";

const ICON_MAP = {
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
  Wallet: Wallet,
  MapPin: MapPin,
  Home: Home,
  Tag: Tag,
  Globe: Globe,
  Users: Users,
};

export default function DhaQuestionExplorer({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState("top");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  
  // Personalization state
  const [userGoal, setUserGoal] = useState("");
  const [userBudget, setUserBudget] = useState("");

  // Hook rotating animation index
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotate hook questions
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setRotatingIndex((prev) => (prev + 1) % HOOK_ROTATING_QUESTIONS.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset view when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedQuestion(null);
      setCustomQuestion("");
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter questions based on category and search query
  const filteredQuestions = DHA_QUESTIONS.filter((q) => {
    if (searchQuery.trim()) {
      return q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
             q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeCategory === "top") {
      return q.isTop;
    }
    return q.category === activeCategory;
  });

  // WhatsApp number
  const whatsappNumber = "923218446496";
  
  // Generate dynamic WhatsApp message
  const generateWhatsAppMessage = (specificQ = "") => {
    let msg = "Hi, I was exploring DHA Lahore properties on The Zalmi Marketing website.";
    if (userGoal) {
      msg += ` I am primarily looking into ${userGoal.toLowerCase()}.`;
    }
    if (userBudget) {
      msg += ` My approximate budget is ${userBudget}.`;
    }
    if (specificQ) {
      msg += ` My question is: "${specificQ}"`;
    } else if (selectedQuestion) {
      msg += ` My question is: "${selectedQuestion.question}"`;
    } else {
      msg += " I would like expert advice on DHA Lahore options.";
    }
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleCustomQuestionSubmit = (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    // Open WhatsApp with custom question pre-filled
    const url = generateWhatsAppMessage(customQuestion);
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-background border border-[#F5A623]/30 dark:border-[#D4AF37]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D4AF37] flex items-center justify-center text-slate-950 font-bold shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">What Are You Thinking About DHA Lahore?</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">Interactive Property & Investment Question Explorer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {selectedQuestion ? (
            /* ================= ANSWER VIEW ================= */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5A623] dark:text-[#D4AF37] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Popular Questions
              </button>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F5A623]/10 text-[#F5A623] dark:text-[#D4AF37] font-semibold">
                    {selectedQuestion.category.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedQuestion.question}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {selectedQuestion.answer}
                </p>
              </div>

              {/* Personalization / What matters most to you */}
              <div className="bg-slate-900/40 border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#F5A623]" /> What matters most to you in DHA?
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Long-term growth", "Quick resale", "Rental income", "Personal use"].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setUserGoal(goal)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                        userGoal === goal
                          ? "bg-[#F5A623] text-slate-950 border-[#F5A623] font-bold shadow-md"
                          : "bg-background hover:bg-muted/60 border-border text-foreground"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Related Questions Loop */}
              {selectedQuestion.followUps && selectedQuestion.followUps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    You may also want to know
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedQuestion.followUps.map((followUpId) => {
                      const qObj = DHA_QUESTIONS.find((item) => item.id === followUpId);
                      if (!qObj) return null;
                      return (
                        <button
                          key={followUpId}
                          onClick={() => {
                            setSelectedQuestion(qObj);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/40 hover:border-[#F5A623]/50 transition-all text-left group"
                        >
                          <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-[#F5A623] transition-colors">
                            {qObj.question}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#F5A623] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WhatsApp Escalation Box inside Answer */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-500 mx-auto flex items-center justify-center">
                  <FaWhatsapp className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground">Want advice for YOUR situation?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Tell us what you're looking for and we'll continue the conversation on WhatsApp with an expert.
                  </p>
                </div>
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  <FaWhatsapp className="w-5 h-5" /> Continue on WhatsApp
                </a>
              </div>

            </div>
          ) : (
            /* ================= EXPLORER HOME VIEW ================= */
            <div className="space-y-8">
              
              {/* THE HOOK */}
              <div className="text-center space-y-3 py-4 bg-gradient-to-b from-slate-900/60 to-transparent p-6 rounded-2xl border border-border/60">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] dark:text-[#D4AF37]">
                  Discover & Explore
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  What are you really wondering about DHA Lahore?
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Explore the questions investors and property buyers ask before making a decision.
                </p>

                {/* Animated Rotating Question Badge */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 border border-[#F5A623]/40 shadow-md">
                    <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
                    <span className={`text-xs sm:text-sm font-medium text-foreground transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      “{HOOK_ROTATING_QUESTIONS[rotatingIndex]}”
                    </span>
                  </div>
                </div>
              </div>

              {/* OPTIONAL LIGHTWEIGHT PERSONALIZATION BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card/60 p-4 rounded-2xl border border-border">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    1. What are you looking for? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Investment", "Living", "Buying", "Selling"].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setUserGoal(userGoal === goal ? "" : goal)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          userGoal === goal
                            ? "bg-[#F5A623] text-slate-950 border-[#F5A623] font-bold"
                            : "bg-background hover:bg-muted border-border text-foreground"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    2. Approximate budget? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Under 50L", "50L–1Cr", "1Cr–2Cr", "2Cr+"].map((b) => (
                      <button
                        key={b}
                        onClick={() => setUserBudget(userBudget === b ? "" : b)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          userBudget === b
                            ? "bg-[#F5A623] text-slate-950 border-[#F5A623] font-bold"
                            : "bg-background hover:bg-muted border-border text-foreground"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEARCH & CATEGORIES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Popular Questions
                  </h3>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                    />
                  </div>
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {DHA_CATEGORIES.map((cat) => {
                    const IconComponent = ICON_MAP[cat.icon] || Sparkles;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSearchQuery("");
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all ${
                          activeCategory === cat.id && !searchQuery
                            ? "bg-gradient-to-r from-[#F5A623] to-[#D4AF37] text-slate-950 font-bold shadow-md"
                            : "bg-card border border-border text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUESTION CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredQuestions.map((q) => {
                  const catObj = DHA_CATEGORIES.find((c) => c.id === q.category);
                  const CatIcon = ICON_MAP[catObj?.icon] || Sparkles;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-card border border-border/80 hover:border-[#F5A623]/60 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-semibold group-hover:bg-[#F5A623]/10 group-hover:text-[#F5A623] transition-colors">
                            <CatIcon className="w-3 h-3" /> {catObj?.label || q.category}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-[#F5A623] transition-colors">
                          {q.question}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                        <span>Read expert insight</span>
                        <span className="inline-flex items-center gap-1 text-[#F5A623] dark:text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform">
                          Explore <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No questions found matching your search.</p>
                </div>
              )}

              {/* HAVE SOMETHING ELSE ON YOUR MIND? */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-[#F5A623]/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#F5A623]" /> Have something else on your mind?
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ask your specific DHA question and chat directly with our expert team on WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. I have 80 lakh. Where should I invest in Phase 9?"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" /> Ask Expert
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Examples:</span>
                  <button type="button" onClick={() => setCustomQuestion("I have 80 lakh. Where should I invest?")} className="hover:text-[#F5A623] underline">
                    “I have 80 lakh. Where should I invest?”
                  </button>
                  <span>•</span>
                  <button type="button" onClick={() => setCustomQuestion("Is Phase 8 better than Phase 6?")} className="hover:text-[#F5A623] underline">
                    “Is Phase 8 better than Phase 6?”
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Escalation Banner */}
        <div className="px-6 py-4 border-t border-border bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold text-foreground">Ready for personalized guidance?</p>
            <p className="text-[11px] text-muted-foreground">Connect with our certified DHA Lahore property advisors instantly.</p>
          </div>
          <a
            href={generateWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            <FaWhatsapp className="w-4 h-4" /> Talk to DHA Expert
          </a>
        </div>

      </div>
    </div>
  );
}
