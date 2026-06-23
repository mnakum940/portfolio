"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NyraEntity from "./NyraEntity";

interface MessageAction {
  label: string;
  icon: string;
  href: string;
}

interface Message {
  sender: "user" | "nyra";
  text: string;
  isTyping?: boolean;
  actions?: MessageAction[];
}

const GREETINGS = [
  "Hello there. Looking for something specific?",
  "Need help exploring Meet's portfolio? Just ask me.",
  "I can guide you through projects, skills, research, and experience.",
  "Want the quick tour? I'll show you around."
];

const FAREWELLS = [
  "See you later. Thank you for your time.",
  "It was a pleasure assisting you. Have a great day.",
  "Take care. I'll be here whenever you need me.",
  "Thanks for visiting. Feel free to come back anytime.",
  "Until next time. Wishing you a wonderful day ahead.",
  "Goodbye for now. It was nice exploring the portfolio with you.",
  "I'll be around if you need anything else. See you soon.",
  "Thank you for spending some time with me. Have a productive day."
];

export default function NyraCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [companionState, setCompanionState] = useState<"idle" | "listening" | "thinking" | "speaking" | "greeting" | "farewell">("idle");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "nyra",
      text: "System initialized. I am NYRA, your spatial AI companion. How can I guide you through Meet Nakum's portfolio and research?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [bubble, setBubble] = useState<{ type: "greeting" | "farewell" | null; text: string }>({ type: null, text: "" });

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleStartTimeRef = useRef<number>(0);
  const bubbleTimeRemainingRef = useRef<number>(0);
  const lastFarewellRef = useRef<string | null>(null);

  // Greeting proactive trigger
  useEffect(() => {
    // 8-12 seconds delay (we choose 10 seconds)
    const delayTimer = setTimeout(() => {
      const greetingShown = sessionStorage.getItem("nyra_greeting_shown");
      if (!isOpen && !hasInteracted && !greetingShown) {
        const randomIndex = Math.floor(Math.random() * GREETINGS.length);
        const greeting = GREETINGS[randomIndex];

        sessionStorage.setItem("nyra_greeting_shown", "true");
        setBubble({ type: "greeting", text: greeting });
        setCompanionState("greeting");

        // Start auto-dismiss timer of 7 seconds
        bubbleStartTimeRef.current = Date.now();
        bubbleTimeRemainingRef.current = 7000;
        bubbleTimeoutRef.current = setTimeout(() => {
          setBubble({ type: null, text: "" });
          setCompanionState("idle");
        }, 7000);
      }
    }, 10000);

    return () => {
      clearTimeout(delayTimer);
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, [isOpen, hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);

    // Choose randomized farewell message
    const filteredFarewells = FAREWELLS.filter((f) => f !== lastFarewellRef.current);
    const randomIndex = Math.floor(Math.random() * filteredFarewells.length);
    const farewell = filteredFarewells[randomIndex];

    lastFarewellRef.current = farewell;

    setBubble({ type: "farewell", text: farewell });
    setCompanionState("farewell");

    // Clear any active bubble timer
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }

    // Show farewell for 5 seconds, then transition back to idle
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubble({ type: null, text: "" });
      setCompanionState("idle");
    }, 5000);
  };

  const toggleOpen = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      setHasInteracted(true);
      setCompanionState("idle");
      // Clear any greeting/farewell bubble immediately when opening
      setBubble({ type: null, text: "" });
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
        bubbleTimeoutRef.current = null;
      }
    }
  };

  const handleBubbleMouseEnter = () => {
    if (bubble.type === "greeting" && bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = null;
      const elapsed = Date.now() - bubbleStartTimeRef.current;
      bubbleTimeRemainingRef.current = Math.max(0, bubbleTimeRemainingRef.current - elapsed);
    }
  };

  const handleBubbleMouseLeave = () => {
    if (bubble.type === "greeting" && !bubbleTimeoutRef.current) {
      const remaining = Math.max(3000, bubbleTimeRemainingRef.current);
      bubbleStartTimeRef.current = Date.now();
      bubbleTimeRemainingRef.current = remaining;
      bubbleTimeoutRef.current = setTimeout(() => {
        setBubble({ type: null, text: "" });
        setCompanionState("idle");
      }, remaining);
    }
  };

  const handleBubbleClick = () => {
    if (bubble.type === "greeting") {
      setIsOpen(true);
      setHasInteracted(true);
      setCompanionState("idle");
      setBubble({ type: null, text: "" });
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
        bubbleTimeoutRef.current = null;
      }
    } else if (bubble.type === "farewell") {
      setBubble({ type: null, text: "" });
      setCompanionState("idle");
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
        bubbleTimeoutRef.current = null;
      }
    }
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Programmatically click a mock link to invoke Navbar's springScrollTo
  const triggerScrollAndSpotlight = (sectionId: string) => {
    const link = document.createElement("a");
    link.href = `#${sectionId}`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Dispatch spotlight trigger after spring scroll completes or starts settling
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("spotlight_section", { detail: { id: sectionId } })
      );
    }, 700);
  };

  // Local NLP Router
  const handleQuery = (query: string) => {
    setCompanionState("thinking");
    
    // Simulate brief computational thinking delay
    setTimeout(() => {
      const q = query.toLowerCase();
      let replyText = "";
      let targetSection: string | null = null;
      let actions: MessageAction[] = [];

      // Resume / CV queries
      if (q.includes("resume") || q.includes("cv") || q.includes("download") && (q.includes("resume") || q.includes("cv"))) {
        replyText = "Certainly. You can access Meet's latest resume below.";
        actions = [{ label: "View Resume", icon: "description", href: "/Meet_Nakum_Resume.pdf" }];
      } else if (q.includes("project") || q.includes("work") || q.includes("create") || q.includes("aegis") || q.includes("nyra") || q.includes("quantum")) {
        replyText = "Meet has built advanced intelligent systems, including NYRA (this autonomous conversational agent) and AEGIS V (a surgical-grade security layer preventing LLM prompt injections). Let me navigate you to his Projects portfolio.";
        targetSection = "projects";
        actions = [{ label: "View Projects", icon: "folder_special", href: "#projects" }];
      } else if (q.includes("education") || q.includes("study") || q.includes("college") || q.includes("degree") || q.includes("mtech") || q.includes("btech") || q.includes("jain")) {
        replyText = "Meet Nakum is pursuing his M.Tech in Artificial Intelligence & Data Science, focusing on Agentic AI. He previously completed a B.Tech in Computer Science and Engineering from Jain University. Let me scroll you to the Experience timeline.";
        targetSection = "experience";
      } else if (q.includes("experience") || q.includes("intern") || q.includes("job") || q.includes("unified mentors")) {
        replyText = "Meet has professional data science experience, including working as a Data Analyst Intern at Unified Mentors, where he automated ETL pipelines and developed customer analytics models. Let me scroll to the Experience section.";
        targetSection = "experience";
      } else if (q.includes("publication") || q.includes("paper") || q.includes("write") || q.includes("article") || q.includes("journal") || q.includes("icdcn") || q.includes("irjmets")) {
        replyText = "Meet has published multiple research papers, including adversarial robustness protocols in distributed LLM architectures (ICDCN 2025) and threat intelligence agents (IRJMETS 2025). Let me direct you to his Publications list.";
        targetSection = "publications";
      } else if (q.includes("research") || q.includes("domain") || q.includes("focus") || q.includes("interest") || q.includes("mlops") || q.includes("multimodal")) {
        replyText = "Meet's primary research domains reside at the intersection of Agentic AI, LLM Security, Multimodal Systems, and MLOps, focusing on defensive security frameworks. Let's look at the Research section.";
        targetSection = "research";
      } else if (q.includes("skill") || q.includes("technolog") || q.includes("stack") || q.includes("python") || q.includes("pytorch") || q.includes("tensorflow") || q.includes("react") || q.includes("typescript")) {
        replyText = "Meet Nakum's core technology stack includes Python, PyTorch, LangChain, TensorFlow, Next.js, React, TypeScript, and cloud servers (GCP & AWS). Here is his full skill roster in the marquee section.";
        targetSection = "about";
      } else if (q.includes("contact") || q.includes("email") || q.includes("hire") || q.includes("reach")) {
        replyText = "You can contact Meet directly or send a transmission using the form below. Here are his direct channels.";
        targetSection = "contact";
        actions = [
          { label: "Contact Meet", icon: "mail", href: "#contact" },
          { label: "LinkedIn", icon: "link", href: "#" },
          { label: "GitHub", icon: "code", href: "#" },
        ];
      } else if (q.includes("linkedin")) {
        replyText = "Here's a direct link to Meet Nakum's LinkedIn profile.";
        actions = [{ label: "LinkedIn", icon: "link", href: "#" }];
      } else if (q.includes("github")) {
        replyText = "Here's a direct link to Meet's GitHub repositories.";
        actions = [{ label: "GitHub", icon: "code", href: "#" }];
      } else if (q.includes("bio") || q.includes("profile") || q.includes("who is") || q.includes("about") || q.includes("meet") || q.includes("background")) {
        replyText = "Meet Nakum is an AI Engineer and M.Tech researcher engineering autonomous systems and zero-trust security perimeters for LLMs. Let me show you his biography in the About section.";
        targetSection = "about";
      } else if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("greetings")) {
        replyText = "Greetings. Connection established. I can guide you through Meet Nakum's professional profile. Try asking about his projects, education, publications, resume, or skills.";
      } else {
        replyText = "I have scanned Meet Nakum's data blocks, but that specific query is not fully mapped. You can ask about his projects, research publications, education, technology skills, resume, or direct contact methods.";
      }

      // Add placeholder message for typewriter animation
      setMessages((prev) => [...prev, { sender: "nyra", text: "", isTyping: true }]);
      setCompanionState("speaking");

      // Typewriter Effect Simulation
      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength += 2; // Type two chars at a time for snappier experience
        const slice = replyText.substring(0, currentLength);
        
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, text: slice } : msg
          )
        );

        if (currentLength >= replyText.length) {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1
                ? { ...msg, isTyping: false, actions: actions.length > 0 ? actions : undefined }
                : msg
            )
          );
          setCompanionState("idle");
          
          // Trigger smooth scrolling and spotlight glow if applicable
          if (targetSection) {
            triggerScrollAndSpotlight(targetSection);
          }
        }
      }, 15);

    }, 850);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setHasInteracted(true);
    const userText = inputValue;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputValue("");
    handleQuery(userText);
  };

  return (
    <>
      {/* Waveform and ambient lighting on open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-radial from-primary via-secondary to-transparent blur-[120px] pointer-events-none z-[9980]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-[9990] font-body flex flex-col items-end">
        {/* Terminal panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-card backdrop-blur-2xl bg-surface-container-low/60 w-[340px] sm:w-[380px] h-[480px] rounded-[30px] border border-white/10 shadow-2xl flex flex-col mb-4 overflow-hidden relative"
            >
              {/* Terminal header */}
              <div className="px-6 py-4 bg-surface-container-low/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-ping" />
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-on-surface uppercase font-display">
                      NYRA OS v1.0
                    </h3>
                    <p className="text-[9px] text-primary tracking-widest font-semibold uppercase">
                      STATUS: {companionState.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  aria-label="Minimize terminal"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Holographic Visualizer Area */}
              <div className="h-28 border-b border-white/5 bg-gradient-to-b from-surface-container-lowest/20 to-surface-container-low/10 flex items-center justify-center relative">
                <div className="w-20 h-20 select-none">
                  <NyraEntity state={companionState} />
                </div>
                
                {/* Simulated Telemetry Audio Waveform */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-0.5 items-end h-6 pointer-events-none opacity-40">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const baseDelay = i * 0.05;
                    const duration = 0.5 + Math.random() * 0.8;
                    const isActive = companionState !== "idle";
                    
                    return (
                      <motion.div
                        key={i}
                        className="w-[2px] bg-primary rounded-full"
                        animate={{
                          height: isActive ? [4, 18, 4] : [2, 6, 2],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: duration,
                          delay: baseDelay,
                          ease: "easeInOut",
                        }}
                        style={{ height: 4 }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Chat Dialog box */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 custom-scrollbar bg-surface-container-lowest/10">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[8px] font-semibold text-on-surface-variant/40 tracking-wider mb-1 uppercase">
                      {msg.sender === "user" ? "MEET_GUEST" : "NYRA_CORE"}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/5 rounded-tr-sm"
                          : "glass-card border-white/5 text-on-surface-variant rounded-tl-sm"
                      }${msg.actions && msg.actions.length > 0 ? " pb-1" : ""}`}
                    >
                      {msg.text}
                      {msg.isTyping && (
                        <span className="inline-block w-1.5 h-3 bg-primary ml-1 animate-pulse" />
                      )}
                      {/* Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && !msg.isTyping && (
                        <div className="flex flex-wrap gap-2 mt-2.5 pt-2 border-t border-white/5">
                          {msg.actions.map((action, actionIdx) => (
                            <motion.a
                              key={actionIdx}
                              href={action.href}
                              target={action.href.startsWith("#") ? undefined : "_blank"}
                              rel={action.href.startsWith("#") ? undefined : "noopener noreferrer"}
                              onClick={(e) => {
                                if (action.href.startsWith("#")) {
                                  e.preventDefault();
                                  const sectionId = action.href.substring(1);
                                  triggerScrollAndSpotlight(sectionId);
                                }
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: actionIdx * 0.1, duration: 0.3 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-primary/20 text-primary text-[10px] font-bold tracking-wider uppercase hover:bg-primary/15 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(95,168,255,0.2)] transition-all duration-200 cursor-pointer active:scale-95 select-none group/action"
                            >
                              <span className="material-symbols-outlined text-[14px] group-hover/action:scale-110 transition-transform">{action.icon}</span>
                              {action.label}
                            </motion.a>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-white/5 bg-surface-container-low/80 backdrop-blur-xl flex items-center gap-3"
              >
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => {
                    setHasInteracted(true);
                    if (companionState === "idle") setCompanionState("listening");
                  }}
                  onBlur={() => {
                    if (companionState === "listening") setCompanionState("idle");
                  }}
                  className="flex-1 bg-surface-container-lowest border border-white/10 rounded-full px-4 py-2.5 text-xs outline-none focus:border-primary transition-all text-on-surface placeholder:text-outline-variant font-body"
                  placeholder="Query system database..."
                  type="text"
                />
                <button
                  type="submit"
                  disabled={companionState === "thinking" || companionState === "speaking"}
                  className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speech Bubble */}
        <AnimatePresence>
          {!isOpen && bubble.type && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              onMouseEnter={handleBubbleMouseEnter}
              onMouseLeave={handleBubbleMouseLeave}
              onClick={handleBubbleClick}
              className="glass-card backdrop-blur-2xl bg-surface-container-low/80 border border-primary/20 shadow-[0_0_30px_rgba(95,168,255,0.15)] rounded-2xl p-4 text-xs text-on-surface-variant leading-relaxed text-left w-[240px] sm:w-[280px] mb-4 cursor-pointer relative group/bubble select-none"
            >
              {/* Emissive lighting inside bubble */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${bubble.type === 'greeting' ? 'bg-primary' : 'bg-secondary'} animate-pulse`} />
                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase font-display">
                    {bubble.type === 'greeting' ? 'NYRA TRANSMISSION' : 'NYRA CORE'}
                  </span>
                </div>
                <p className="font-body text-on-surface">{bubble.text}</p>
                {bubble.type === 'greeting' && (
                  <span className="text-[9px] font-semibold text-primary/60 mt-2 block hover:text-primary transition-colors">
                    Click to initialize response protocol →
                  </span>
                )}
              </div>

              {/* Triangle pointer at the bottom right pointing to NYRA */}
              <div className="absolute bottom-[-6px] right-8 w-3 h-3 bg-surface-container-low/80 border-r border-b border-white/10 rotate-45 pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closed Core Floating Bubble trigger */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOpen}
          className={`w-20 h-20 rounded-full glass-card border flex items-center justify-center cursor-pointer relative group transition-all duration-300 ${
            isOpen ? "border-primary/40 shadow-[0_0_20px_rgba(95,168,255,0.25)]" : "border-white/10 hover:border-primary/30"
          }`}
          title={isOpen ? "Minimize NYRA" : "Initialize NYRA"}
        >
          {/* Pulsating outer neon ring */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full border border-primary/20 scale-105 animate-ping opacity-30" />
          )}
          
          <div className="w-16 h-16">
            <NyraEntity state={isOpen ? "idle" : companionState} />
          </div>
          
          {/* Tiny companion identity tag on hover */}
          {!isOpen && (
            <div className="absolute right-22 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 text-[10px] tracking-[0.1em] font-bold text-primary px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none select-none">
              INITIALIZE NYRA
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
