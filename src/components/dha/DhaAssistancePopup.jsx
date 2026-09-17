import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { ChevronRight, ArrowLeft, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { PROBLEM_CATEGORIES } from "@/data/dhaAssistanceData";

export default function DhaAssistancePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionCategory, setSessionCategory] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  // In-memory state only (no localStorage/sessionStorage)
  const [shuffledCategories, setShuffledCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);

  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Initialize shuffled categories once in memory on mount and schedule Popup 1
  // ensuring it waits if global Popup is pending or active and appears exactly 2.5s after its closure.
  useEffect(() => {
    const validCategories = PROBLEM_CATEGORIES.filter(c => !c.isCustom);
    const arr = [...validCategories];
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledCategories(arr);
    setCurrentIndex(0);
    if (arr.length > 0) {
      setSessionCategory(arr[0]);
    }

    const scheduleFirstPopup = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
    };

    if (window.__globalPopupPending || window.__globalPopupOpen) {
      const handlePopupClosed = () => {
        window.removeEventListener('global-popup-closed', handlePopupClosed);
        scheduleFirstPopup();
      };
      window.addEventListener('global-popup-closed', handlePopupClosed);
    } else {
      const checkTimer = setTimeout(() => {
        if (window.__globalPopupPending || window.__globalPopupOpen) {
          const handlePopupClosed = () => {
            window.removeEventListener('global-popup-closed', handlePopupClosed);
            scheduleFirstPopup();
          };
          window.addEventListener('global-popup-closed', handlePopupClosed);
        } else {
          scheduleFirstPopup();
        }
      }, 700);

      return () => {
        clearTimer();
        clearTimeout(checkTimer);
      };
    }

    return () => {
      clearTimer();
    };
  }, []);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      // Popup was closed
      setCurrentStepIndex(0);
      setAnswers({});
      setIsCompleted(false);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= shuffledCategories.length) {
        setSequenceCompleted(true);
        return;
      }

      setCurrentIndex(nextIndex);
      const nextCat = shuffledCategories[nextIndex];
      setSessionCategory(nextCat);

      // Determine delay based on nextIndex:
      // nextIndex === 1 (Popup 2): 30 seconds after Popup 1 closed
      // nextIndex === 2 (Popup 3): 45 seconds after Popup 2 closed
      // nextIndex >= 3 (Popup 4+): 90 seconds (1 min 30 sec) after previous closed
      let delayMs = 90000;
      if (nextIndex === 1) {
        delayMs = 30000;
      } else if (nextIndex === 2) {
        delayMs = 45000;
      } else {
        delayMs = 90000;
      }

      clearTimer();
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, delayMs);
    }
  };

  const handleAnswerOption = (questionId, option) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);

    if (sessionCategory && currentStepIndex < sessionCategory.questions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const resetFlow = () => {
    setCurrentStepIndex(0);
    setAnswers({});
    setIsCompleted(false);
  };

  // WhatsApp number
  const whatsappNumber = "923218446496";
  
  const getWhatsAppUrl = () => {
    if (!sessionCategory) return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I need assistance with DHA Lahore property.")}`;
    const message = sessionCategory.generateMessage(answers);
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  if (!sessionCategory || sequenceCompleted) return null;

  const currentQ = sessionCategory.questions[currentStepIndex];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-border shadow-2xl p-4 sm:p-6" data-lenis-prevent>
        
        {/* Header */}
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D4AF37] flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F5A623] dark:text-[#D4AF37]">
              Property Assistant
            </span>
          </div>
          
          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {isCompleted
              ? "Got it. We have the details."
              : sessionCategory.title}
          </DialogTitle>
          
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {isCompleted
              ? "Would you like to discuss this with our property team?"
              : `Question ${currentStepIndex + 1} of ${sessionCategory.questions.length}`}
          </DialogDescription>
        </DialogHeader>

        {/* Body content */}
        <div className="mt-4 space-y-4">
          
          {!isCompleted && currentQ && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  {currentQ.question}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswerOption(currentQ.id, opt)}
                      className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium border border-border bg-background hover:bg-muted/60 hover:border-[#F5A623]/60 transition-all text-left flex items-center justify-between group"
                    >
                      <span className="text-foreground">{opt}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#F5A623] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {currentStepIndex > 0 && (
                <button
                  onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-3 h-3" /> Previous question
                </button>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-300 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600/20 text-emerald-500 mx-auto flex items-center justify-center">
                <FaWhatsapp className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  We have everything we need to understand your requirement. Click below to continue our conversation instantly on WhatsApp with an expert.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <FaWhatsapp className="w-5 h-5" /> Continue on WhatsApp
                </a>

                <button
                  onClick={resetFlow}
                  className="text-xs text-muted-foreground hover:text-foreground underline pt-1"
                >
                  Start over / Change answers
                </button>
              </div>
            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}
