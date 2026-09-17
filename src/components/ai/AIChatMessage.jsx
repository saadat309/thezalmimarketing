import React from "react";
import { Link } from "@tanstack/react-router";
import AIPropertyResults from "./AIPropertyResults";
import AIFileResults from "./AIFileResults";
import AIMapResults from "./AIMapResults";
import AICalculatorResults from "./AICalculatorResults";
import { User } from "lucide-react";
import { BsRobot } from "react-icons/bs";
import siteNav from "../../content/ai-knowledge/site-navigation.json";

export default function AIChatMessage({ message }) {
  const { role, content, toolName, toolResult } = message;
  const isUser = role === "user";

  const isUrdu = /[\u0600-\u06FF]/.test(content);

  const renderContent = (text) => {
    // Regex for inline phone/email patterns to style them as links in place
    const phoneRegex = /(\+92 \d{3} \d{7})/g;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

    // Split by Markdown links OR phone/email patterns
    const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\+92 \d{3} \d{7}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);

    return parts.map((part, index) => {
      // 1. Check for markdown-style links
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const [_, title, url] = match;
        if (url.startsWith("/")) {
          return <Link key={index} to={url} className="text-[#F5A623] hover:underline font-bold">{title}</Link>;
        } else {
          return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline font-bold">{title}</a>;
        }
      }

      // 2. Check for phone numbers
      if (phoneRegex.test(part)) {
        return <a key={index} href={`tel:${part.replace(/\s/g, '')}`} className="text-[#F5A623] hover:underline font-bold">{part}</a>;
      }

      // 3. Check for emails
      if (emailRegex.test(part)) {
        return <a key={index} href={`mailto:${part}`} className="text-[#F5A623] hover:underline font-bold">{part}</a>;
      }

      return part;
    });
  };

  const getContactActions = () => {
    if (content.toLowerCase().includes("contact") || content.toLowerCase().includes("whatsapp") || content.toLowerCase().includes("phone") || content.toLowerCase().includes("email") || content.toLowerCase().includes("office") || content.toLowerCase().includes("address")) {
        return [
            { label: "Call Us", url: "tel:+923218446496", type: "phone" },
            { label: "WhatsApp Us", url: "https://wa.me/923218446496", type: "external" },
            { label: "Email Us", url: "mailto:thezalmimarkettingsajidmahmood@gmail.com", type: "email" },
            { label: "Contact Us", url: "/contact", type: "internal" }
        ];
    }
    return [];
  };

  const contactActions = getContactActions();

  return (
    <div className={`flex gap-3 my-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#F5A623] dark:bg-[#D4AF37] text-slate-950 flex items-center justify-center shrink-0 shadow-md">
          <BsRobot size={18} />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words ${
          isUser
            ? "bg-[#F5A623] dark:bg-[#D4AF37] text-slate-950 rounded-tr-none font-medium"
            : "bg-card border border-border text-foreground rounded-tl-none"
        }`}
        dir={isUrdu ? "rtl" : "auto"}
      >
        <div
          className={`whitespace-pre-wrap leading-relaxed break-words ${isUrdu ? "text-base" : "font-sans"}`}
          style={isUrdu ? { fontFamily: '"Noto Nastaliq Urdu", serif', lineHeight: 2.2 } : {}}
        >
          {renderContent(content)}
        </div>

        {/* Render tool results OR manual CTAs */}
        {!isUser && (toolResult || contactActions.length > 0 || (toolName === null && content && siteNav.pages.some(p => content.includes(p.title)))) && (
          <div className="mt-3" dir="ltr">
            {/* Tool Results */}
            {toolName === "search_properties" && toolResult?.properties && (
              <AIPropertyResults properties={toolResult.properties} />
            )}
            {toolName === "search_files" && toolResult?.files && (
              <AIFileResults files={toolResult.files} />
            )}
            {toolName === "search_maps" && toolResult?.maps && (
              <AIMapResults maps={toolResult.maps} />
            )}
            {toolName === "calculate_transfer_expenses" && (
              <AICalculatorResults calc={toolResult} />
            )}
            
            {/* Contact Actions */}
            <div className="flex flex-wrap gap-2 mb-2">
                {contactActions.map(action => (
                    <a key={action.label} href={action.url} className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 border border-primary/20">
                        {action.label}
                    </a>
                ))}
            </div>
            
            {/* Manual Navigation Links/CTAs */}
            {siteNav.pages.map(page => {
                if (!contactActions.find(a => a.label === page.title) && (page.keywords.some(k => content.toLowerCase().includes(k)) || content.toLowerCase().includes(page.title.toLowerCase()))) {
                    return (
                        <Link 
                            key={page.id} 
                            to={page.url}
                            className="inline-block mt-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 mr-2"
                        >
                            {page.title}
                        </Link>
                    )
                }
                return null;
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shrink-0 shadow-md">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
