"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredSettings, DEFAULT_SETTINGS, ProfileSettings } from "../utils/db";

/**
 * Spring-based "snappy" scroll.
 * Underdamped spring that overshoots slightly then settles —
 * sharp and energetic vs boring smooth scrolling.
 */
function springScrollTo(targetY: number, duration = 800) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;
  const startTime = performance.now();

  const damping = 0.72;
  const frequency = 4.5;

  function springEase(t: number): number {
    const decay = Math.exp(-damping * frequency * t);
    const omega = frequency * Math.sqrt(1 - damping * damping);
    return 1 - decay * (Math.cos(omega * t) + (damping * frequency / omega) * Math.sin(omega * t));
  }

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = springEase(t);
    window.scrollTo(0, startY + distance * easedT);
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());

    const handleSync = () => {
      setSettings(getStoredSettings());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("settings_updated", handleSync);

    // Global scroll interceptor for hash links
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#")) {
          if (href === "#") {
            e.preventDefault();
            springScrollTo(0, 750);
            setIsOpen(false);
          } else {
            const id = href.substring(1);
            const el = document.getElementById(id);
            if (el) {
              e.preventDefault();
              const navHeight = 72;
              const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight;
              springScrollTo(targetY, 750);
              setIsOpen(false);
            }
          }
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("settings_updated", handleSync);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Projects", href: "#projects" },
    { name: "Research", href: "#research" },
    { name: "Experience", href: "#experience" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-[72px] z-50 bg-surface/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto h-full">
          <a
            className="font-display text-[18px] font-bold tracking-tighter text-on-surface hover:text-primary transition-colors"
            href="#"
          >
            {settings.name.toUpperCase()}
          </a>
          
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
                href={link.href}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/Meet_Nakum_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-[12px] tracking-[0.1em] hover:shadow-[0_0_20px_rgba(163,201,255,0.3)] transition-all active:scale-95 inline-block text-center"
            >
              RESUME
            </a>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden text-on-surface hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {isOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 w-full z-40 bg-surface-container-low/95 backdrop-blur-2xl border-b border-white/5 flex flex-col items-center py-8 gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                className="text-on-surface-variant text-lg font-medium hover:text-primary transition-colors duration-300"
                href={link.href}
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
