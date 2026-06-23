"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { cmd: "> Booting Portfolio Environment for Meet Nakum...", status: "OK" },
  { cmd: "> Loading Introduction Module...", status: "OK" },
  { cmd: "> Loading About Section...", status: "OK" },
  { cmd: "> Loading Projects Database...", status: "OK" },
  { cmd: "> Loading Research Publications...", status: "OK" },
  { cmd: "> Loading Experience Timeline...", status: "OK" },
  { cmd: "> Establishing Spatial Interface...", status: "OK" },
  { cmd: "> Waking up NYRA AI Companion...", status: "ONLINE" },
  { cmd: "> Synchronizing Knowledge Base...", status: "COMPLETE" },
  { cmd: "> System Check...", status: "READY" },
];

// Scheduled glitch pulse times (seconds)
const GLITCH_TIMES = [0.4, 1.3, 2.7, 4.1];
const GLITCH_DURATION = 200; // ms per pulse

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<{ cmd: string; status: string; typed: string; statusShown: boolean }[]>([]);
  const [progress, setProgress] = useState(0);
  const [bootDone, setBootDone] = useState(false);

  const [exiting, setExiting] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchDisabled, setGlitchDisabled] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const glitchAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Preload and attempt autoplay of glitch sound (plays once, silent fail if blocked)
  useEffect(() => {
    const audio = new Audio("/virtual_vibes-glitch-sound-effect-hd-379466.mp3");
    audio.loop = false; // Play once only
    audio.preload = "auto";
    glitchAudioRef.current = audio;

    const clickAudio = new Audio("/matthewvakaliuk73627-mouse-click-290204.mp3");
    clickAudio.preload = "auto";
    clickAudioRef.current = clickAudio;

    // Attempt autoplay — silently ignored if browser blocks it
    audio.play().catch(() => {});

    return () => {
      audio.pause();
    };
  }, []);

  // Stop glitch sound with smooth fade out when boot is completed
  useEffect(() => {
    if (bootDone && glitchAudioRef.current) {
      const audio = glitchAudioRef.current;
      let volume = 1;
      const fadeInterval = setInterval(() => {
        volume = Math.max(0, volume - 0.1);
        audio.volume = volume;
        if (volume <= 0) {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, 55); // Smooth 550ms fade out
    }
  }, [bootDone]);

  // Scroll terminal to bottom
  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  // Glitch pulse scheduler
  useEffect(() => {
    if (glitchDisabled) return;
    const timers = GLITCH_TIMES.map((t) =>
      setTimeout(() => {
        if (!glitchDisabled) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), GLITCH_DURATION);
        }
      }, t * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [glitchDisabled]);

  // Boot line typing sequence
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const totalDuration = 5000; // 5 seconds for entire sequence
    const lineCount = BOOT_LINES.length;
    const timePerLine = totalDuration / lineCount; // ~500ms per line

    let lineIndex = 0;

    const processLine = () => {
      if (lineIndex >= lineCount) {
        // All lines done — disable glitch, mark boot done
        setGlitchDisabled(true);
        setBootDone(true);
        return;
      }

      const currentLine = BOOT_LINES[lineIndex];
      const charCount = currentLine.cmd.length;
      const typingDuration = timePerLine * 0.65; // 65% of time for typing
      const charDelay = typingDuration / charCount;

      // Add a new empty line entry
      setLines((prev) => [
        ...prev,
        { cmd: currentLine.cmd, status: currentLine.status, typed: "", statusShown: false },
      ]);

      let charIdx = 0;
      const typeInterval = setInterval(() => {
        charIdx++;
        const currentIdx = lineIndex; // capture for closure
        setLines((prev) =>
          prev.map((l, i) =>
            i === currentIdx ? { ...l, typed: currentLine.cmd.substring(0, charIdx) } : l
          )
        );
        scrollToBottom();

        // Update progress
        const overallProgress = ((currentIdx * charCount + charIdx) / (lineCount * charCount)) * 100;
        setProgress(Math.min(overallProgress, 100));

        if (charIdx >= charCount) {
          clearInterval(typeInterval);
          // Show status after short pause
          setTimeout(() => {
            setLines((prev) =>
              prev.map((l, i) =>
                i === currentIdx ? { ...l, statusShown: true } : l
              )
            );
            scrollToBottom();
            lineIndex++;
            // Small gap before next line
            setTimeout(processLine, timePerLine * 0.15);
          }, timePerLine * 0.2);
        }
      }, charDelay);
    };

    processLine();
  }, [scrollToBottom]);

  const handleInitialize = useCallback(() => {
    if (exiting) return;

    // Trigger preloaded click sound effect
    if (clickAudioRef.current) {
      clickAudioRef.current.play().catch((err) => {
        console.log("Button click sound block:", err);
      });
    }

    setExiting(true);
    // Transition duration ~1s, then call onComplete
    setTimeout(onComplete, 1000);
  }, [exiting, onComplete]);

  // Once boot is done, animate progress to 100% and auto-initialize if not clicked within 5 seconds
  useEffect(() => {
    if (!bootDone || exiting) return;
    setProgress(100);
    const timer = setTimeout(() => {
      handleInitialize();
    }, 5000); // 5 seconds auto-redirect fallback
    return () => clearTimeout(timer);
  }, [bootDone, exiting, handleInitialize]);

  // Status color helper
  const statusColor = (s: string) => {
    if (s === "READY") return "text-green-400";
    if (s === "ONLINE") return "text-cyan-300";
    if (s === "COMPLETE") return "text-blue-400";
    return "text-green-500/80";
  };

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden select-none"
          style={{ fontFamily: "var(--font-jetbrains), monospace" }}
        >

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[150px] pointer-events-none" />

          {/* Scanline overlay (glitch) */}
          {glitchActive && !glitchDisabled && (
            <div
              className="absolute inset-0 pointer-events-none z-50"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)",
                animation: "none",
              }}
            />
          )}

          {/* Main content wrapper with glitch */}
          <div
            className={`relative flex flex-col items-center justify-center w-full transition-all duration-100 ${
              glitchActive && !glitchDisabled
                ? "translate-x-[1px] skew-x-[0.3deg]"
                : ""
            }`}
            style={
              glitchActive && !glitchDisabled
                ? { textShadow: "-2px 0 #ff0040, 2px 0 #00ffff" }
                : {}
            }
          >
            {/* Owner Name — 3D Cyberpunk Glitch Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center mb-6 md:mb-8 relative"
              style={{ perspective: "800px" }}
            >
              {/* Subtitle above name */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 0.4, letterSpacing: "0.3em" }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="text-[9px] md:text-[10px] text-cyan-400/60 uppercase tracking-[0.3em] mb-2 font-medium"
                style={{ fontFamily: "var(--font-jetbrains), monospace" }}
              >
                Portfolio Environment
              </motion.p>

              {/* Glitch title container with 3D perspective */}
              <motion.div
                className="boot-glitch-title relative inline-block animate-pulse-slow"
                initial={{ rotateX: 25, scale: 0.95 }}
                animate={{ rotateX: 0, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Main visible text — 3D extruded */}
                <h1
                  className="text-[34px] sm:text-[46px] md:text-[56px] lg:text-[64px] font-bold text-transparent bg-clip-text uppercase leading-none"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    backgroundImage: "linear-gradient(160deg, #ffffff 0%, #e0f7ff 20%, #00f3ff 50%, #a78bfa 75%, #ffffff 100%)",
                    letterSpacing: "0.08em",
                    WebkitTextStroke: "0.5px rgba(0,243,255,0.15)",
                    filter: "drop-shadow(0 0 25px rgba(0,243,255,0.3)) drop-shadow(0 0 50px rgba(167,139,250,0.15))",
                    textShadow: `
                      0 1px 0 rgba(0,180,216,0.45),
                      0 2px 0 rgba(0,160,200,0.4),
                      0 3px 0 rgba(0,140,180,0.35),
                      0 4px 6px rgba(0,0,0,0.45),
                      0 6px 15px rgba(0,243,255,0.12)
                    `,
                  }}
                >
                  Meet Nakum
                </h1>

                {/* Glitch layer 1 — Red/pink channel */}
                <h1
                  aria-hidden="true"
                  className="boot-glitch-layer-1 absolute inset-0 text-[34px] sm:text-[46px] md:text-[56px] lg:text-[64px] font-bold uppercase leading-none opacity-50 pointer-events-none"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    color: "#ff0040",
                    letterSpacing: "0.08em",
                    mixBlendMode: "screen",
                  }}
                >
                  Meet Nakum
                </h1>

                {/* Glitch layer 2 — Cyan channel */}
                <h1
                  aria-hidden="true"
                  className="boot-glitch-layer-2 absolute inset-0 text-[34px] sm:text-[46px] md:text-[56px] lg:text-[64px] font-bold uppercase leading-none opacity-50 pointer-events-none"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    color: "#00f3ff",
                    letterSpacing: "0.08em",
                    mixBlendMode: "screen",
                  }}
                >
                  Meet Nakum
                </h1>
              </motion.div>

              {/* Decorative gradient line beneath */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3.5 mx-auto h-[1px] w-36 md:w-52 origin-center"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(0,243,255,0.5), rgba(167,139,250,0.3), transparent)",
                }}
              />

              {/* Role subtitle below line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.4em] mt-2.5"
                style={{ fontFamily: "var(--font-jetbrains), monospace" }}
              >
                AI Engineer &amp; Architect
              </motion.p>
            </motion.div>

            {/* Terminal Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-[92vw] max-w-[640px] rounded-2xl overflow-hidden border border-cyan-500/15"
              style={{
                background: "rgba(10,10,10,0.85)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 0 30px rgba(0,255,255,0.06), 0 0 60px rgba(0,255,255,0.02)",
              }}
            >
              {/* Terminal Header — macOS controls */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-cyan-400/60 text-[10px] tracking-wider font-medium ml-2">
                    NYRA_OS v1.0.0
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>

              {/* Terminal Body */}
              <div
                ref={terminalRef}
                className="p-4 md:p-5 h-[180px] sm:h-[220px] md:h-[260px] overflow-y-auto custom-scrollbar space-y-1 text-[11px] md:text-[12px] leading-relaxed"
                style={{ scrollBehavior: "smooth" }}
              >
                {lines.map((line, i) => (
                  <div key={i}>
                    <div className="text-cyan-300/90 font-mono">
                      {line.typed}
                      {!line.statusShown && (
                        <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
                      )}
                    </div>
                    {line.statusShown && (
                      <div className={`${statusColor(line.status)} font-mono text-[10px] ml-2 mb-0.5 opacity-95`}>
                        Status: {line.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-[92vw] max-w-[640px] mt-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden relative">
                  {/* Filled portion */}
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #00b4d8, #00f3ff, #00b4d8)",
                      boxShadow: "0 0 8px rgba(0,243,255,0.25)",
                      transition: "width 0.3s ease-out",
                    }}
                  >
                    {/* Shimmer */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                        animation: "shimmer 1.5s infinite linear",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </motion.div>
                </div>
                <span className="text-cyan-400 text-[11px] font-bold tracking-wider w-10 text-right tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>

            {/* Interactive Initialize Button */}
            <AnimatePresence>
              {bootDone && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 relative z-50"
                >
                  <button
                    onClick={handleInitialize}
                    className="relative px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] text-[#00f3ff] bg-cyan-950/20 border border-cyan-500/35 overflow-hidden group hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(0,243,255,0.35)] transition-all duration-300 cursor-pointer active:scale-95 flex items-center gap-3"
                    style={{ fontFamily: "var(--font-jetbrains), monospace" }}
                  >
                    <span className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors pointer-events-none" />
                    <span className="material-symbols-outlined text-[16px] animate-pulse">power_settings_new</span>
                    INITIALIZE PORTFOLIO
                  </button>
                </motion.div>
              )}
            </AnimatePresence>


          </div>

          {/* Inline keyframe styles */}
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes breathe {
              0%, 100% { box-shadow: 0 0 25px rgba(0,243,255,0.1), inset 0 0 25px rgba(0,243,255,0.03); }
              50% { box-shadow: 0 0 35px rgba(0,243,255,0.2), inset 0 0 30px rgba(0,243,255,0.06); }
            }
            @keyframes glitch-1 {
              0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
              5% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 1px); }
              10% { clip-path: inset(0 0 0 0); transform: translate(0); }
              25% { clip-path: inset(70% 0 5% 0); transform: translate(2px, -1px); }
              30% { clip-path: inset(0 0 0 0); transform: translate(0); }
              52% { clip-path: inset(40% 0 30% 0); transform: translate(-2px, 0); }
              55% { clip-path: inset(0 0 0 0); transform: translate(0); }
              78% { clip-path: inset(10% 0 75% 0); transform: translate(3px, 1px); }
              82% { clip-path: inset(0 0 0 0); transform: translate(0); }
            }
            @keyframes glitch-2 {
              0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
              8% { clip-path: inset(60% 0 10% 0); transform: translate(3px, -1px); }
              12% { clip-path: inset(0 0 0 0); transform: translate(0); }
              35% { clip-path: inset(5% 0 80% 0); transform: translate(-2px, 1px); }
              38% { clip-path: inset(0 0 0 0); transform: translate(0); }
              62% { clip-path: inset(50% 0 20% 0); transform: translate(2px, 0); }
              66% { clip-path: inset(0 0 0 0); transform: translate(0); }
              85% { clip-path: inset(30% 0 50% 0); transform: translate(-3px, -1px); }
              88% { clip-path: inset(0 0 0 0); transform: translate(0); }
            }
            .boot-glitch-layer-1 {
              animation: glitch-1 3s infinite linear;
            }
            .boot-glitch-layer-2 {
              animation: glitch-2 3s infinite linear;
              animation-delay: 0.15s;
            }
          `}</style>
        </motion.div>
      ) : (
        /* Exit: brief NYRA core pulse + fade */
        <motion.div
          key="exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#050505]"
        >
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-24 h-24 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0,243,255,0.6) 0%, rgba(0,243,255,0) 70%)",
              boxShadow: "0 0 60px rgba(0,243,255,0.4)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
