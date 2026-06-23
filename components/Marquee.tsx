"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredSkills, Skill, DEFAULT_SKILLS } from "../utils/db";

export default function Marquee() {
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSkills(getStoredSkills());

    // Listen for admin updates
    const handleSync = (e: StorageEvent) => {
      if (e.key === "portfolio_skills") {
        setSkills(getStoredSkills());
      }
    };
    const handleCustom = () => {
      setSkills(getStoredSkills());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("skills_updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("skills_updated", handleCustom);
    };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const marqueeNames = skills.map((s) => s.name.toUpperCase());

  return (
    <>
      {/* Clickable Marquee Section */}
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer group relative py-8 md:py-16 border-y border-white/5 bg-surface-container-low/20 backdrop-blur-sm overflow-hidden z-10 transition-colors duration-300 hover:bg-surface-container-low/40"
        role="button"
        tabIndex={0}
        aria-label="View all skills"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(true);
        }}
      >
        {/* "Skills" label */}
        <div className="px-margin-mobile lg:px-margin-desktop max-w-container-max mx-auto mb-4 md:mb-6 flex items-center gap-3">
          <span className="font-display text-xs md:text-sm font-semibold text-primary/70 tracking-[0.2em] uppercase">
            Skills & Technologies
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          <span className="text-[10px] md:text-xs text-on-surface-variant/40 group-hover:text-primary/60 transition-colors duration-300">
            Click to explore ↗
          </span>
        </div>

        {/* Marquee Track */}
        <div className="marquee-track">
          <div className="flex gap-8 md:gap-12 px-6 items-center">
            {marqueeNames.map((tech, idx) => (
              <span
                key={`tech1-${tech}-${idx}`}
                className="font-display text-lg md:text-2xl font-bold text-on-surface-variant/40 tracking-wider whitespace-nowrap group-hover:text-on-surface-variant/60 transition-colors duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-8 md:gap-12 px-6 items-center">
            {marqueeNames.map((tech, idx) => (
              <span
                key={`tech2-${tech}-${idx}`}
                className="font-display text-lg md:text-2xl font-bold text-on-surface-variant/40 tracking-wider whitespace-nowrap group-hover:text-on-surface-variant/60 transition-colors duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface-container/95 backdrop-blur-xl shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/10 bg-surface-container/90 backdrop-blur-xl rounded-t-2xl">
                <div>
                  <h3 className="font-display text-lg md:text-xl font-bold text-on-surface">
                    Skills & Technologies
                  </h3>
                  <p className="text-xs md:text-sm text-on-surface-variant/60 mt-1">
                    Tools and frameworks I work with
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  aria-label="Close skills modal"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 4L12 12M12 4L4 12" />
                  </svg>
                </button>
              </div>

              {/* Skills Grid */}
              <div className="px-6 md:px-8 py-6 md:py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {skills.map((skill, idx) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.04,
                        type: "spring",
                        damping: 20,
                        stiffness: 200,
                      }}
                      className="group/card flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-default"
                    >
                      <span className="text-2xl md:text-3xl group-hover/card:scale-110 transition-transform duration-300">
                        {skill.icon}
                      </span>
                      <span className="font-display text-xs md:text-sm font-semibold text-on-surface-variant/80 group-hover/card:text-on-surface transition-colors duration-300 text-center leading-tight">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
