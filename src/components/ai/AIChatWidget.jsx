import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { BsRobot } from "react-icons/bs";
import AIChatMessage from "./AIChatMessage";
import { sendAIChatMessage } from "@/services/ai";

const SUGGESTED_PROMPTS = [
  "Show me 5 marla houses in Lahore under 1 crore",
  "Lahore mein 5 marla ghar 1 crore se kam mein dikhao",
  "لاہور میں ایک کروڑ سے کم 5 مرلہ گھر دکھائیں",
  "Show DHA Phase 8 map",
  "Calculate transfer expenses for 5 marla plot in DHA Phase 6"
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showAttention, setShowAttention] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Assalam-o-Alaikum! I am AI Assistant. How can I help you with real estate, plot files, maps, or transfer expenses today?",
      toolName: null,
      toolResult: null
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Click outside to auto-close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll attention grabber
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (window.scrollY > 350 && !hasOpened && !isOpen) {
        setShowAttention(true);
      } else {
        setShowAttention(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasOpened, isOpen]);

  const handlePointerDown = (e) => {
    if (isOpen) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button') && e.target.closest('button').getAttribute('aria-label') === 'Dismiss attention banner') return;
    draggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current || isOpen) return;
    const newX = e.clientX - startPosRef.current.x;
    const newY = e.clientY - startPosRef.current.y;
    if (Math.hypot(newX - position.x, newY - position.y) > 3) {
      hasMovedRef.current = true;
    }
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleOpenToggle = () => {
    if (hasMovedRef.current) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setHasOpened(true);
      setShowAttention(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const result = await sendAIChatMessage(apiMessages);

      const assistantMessage = {
        role: "assistant",
        content: result.response,
        toolName: result.toolName,
        toolResult: result.toolResult
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        role: "assistant",
        content: "I encountered an issue connecting to the AI service. Please try again in a moment.",
        toolName: null,
        toolResult: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      ref={widgetRef} 
      className={`fixed bottom-6 right-6 z-50 touch-none select-none ${!isOpen ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={!isOpen ? { transform: `translate(${position.x}px, ${position.y}px)` } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {!isOpen ? (
        <div className="relative">
          {/* Real & Connected Attention Preview Card after scrolling */}
          {showAttention && (
            <div className="absolute bottom-[calc(100%+14px)] right-0 w-72 sm:w-80 bg-slate-950/95 dark:bg-slate-900 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#F5A623]/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F5A623] to-[#D4AF37] text-slate-950 flex items-center justify-center font-bold shadow-md text-xs">
                      <BsRobot size={18} />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white font-display">AI Assistant</h4>
                    <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active now • Ready to help
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAttention(false);
                    setHasOpened(true);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Dismiss attention banner"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Assalam-o-Alaikum! Looking for Zalmi Marketing services, DHA investment info, or property transfer tools? I'm here to guide you! 👇
              </p>
              <button
                onClick={handleOpenToggle}
                className="w-full py-2 px-3.5 bg-gradient-to-r from-[#F5A623] to-[#D4AF37] hover:from-[#F5A623]/90 hover:to-[#D4AF37]/90 text-slate-950 font-bold text-xs rounded-xl shadow-[0_8px_20px_rgba(245,166,35,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>Start Live Chat</span>
              </button>
              {/* Speech bubble pointer triangle connected to button */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-950 border-r border-b border-[#F5A623]/50 transform rotate-45" />
            </div>
          )}

          <button
            onClick={handleOpenToggle}
            className="group relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-[#F5A623] via-[#E09612] to-[#D4AF37] hover:from-[#F5A623]/90 hover:to-[#D4AF37]/90 text-slate-950 shadow-[0_15px_40px_rgba(245,166,35,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none"
            aria-label="Open AI Assistant"
          >
            <span className="absolute inset-0 rounded-full bg-[#F5A623] animate-ping opacity-30 group-hover:opacity-50 pointer-events-none" />
            <BsRobot className="w-9 h-9 sm:w-10 sm:h-10 z-10 group-hover:rotate-12 transition-transform text-slate-950" />
            <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 z-20 animate-pulse shadow-md" />

            {/* Tooltip */}
             <span className="absolute right-20 bg-slate-950/90 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl border border-[#F5A623]/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
               AI Assistant
             </span>
          </button>
        </div>
      ) : (
        <div data-lenis-prevent className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F5A623] text-slate-950 flex items-center justify-center font-bold shadow-md">
                <BsRobot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide text-foreground font-display flex items-center gap-1.5 text-white">
                  AI Assistant
                </h3>
                <p className="text-[11px] text-slate-400">Business Concierge</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
                aria-label="Close chat"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-background">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <AIChatMessage key={index} message={msg} />
              ))}

              {isLoading && (
                <div className="flex gap-3 my-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F5A623] text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                    <BsRobot size={18} className="animate-spin" />
                  </div>
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5A623]" />
                    <span>AI Assistant is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts if only welcome message exists */}
            {/*
            {messages.length === 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Suggested questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="text-xs text-left bg-muted/60 hover:bg-[#F5A623]/10 hover:border-[#F5A623]/50 text-foreground px-3 py-2 rounded-xl border border-border transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            */}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Zalmi Marketing services, DHA, or investments..."
                className="flex-1 rounded-2xl border-border bg-background text-sm focus-visible:ring-[#F5A623]"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 p-0 rounded-2xl bg-[#F5A623] hover:bg-[#F5A623]/90 text-slate-950 font-bold shadow-md disabled:opacity-50 shrink-0"
                aria-label="Send message"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
