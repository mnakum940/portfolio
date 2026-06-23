"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredTestimonials, Testimonial } from "../utils/db";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1: left, 1: right

  useEffect(() => {
    setTestimonials(getStoredTestimonials());

    const handleSync = (e: StorageEvent) => {
      if (e.key === "portfolio_testimonials") {
        setTestimonials(getStoredTestimonials());
      }
    };
    const handleCustom = () => {
      setTestimonials(getStoredTestimonials());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("testimonials_updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("testimonials_updated", handleCustom);
    };
  }, []);

  if (testimonials.length === 0) return null;

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];
  const initials = activeTestimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Slide variants for slide animation
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
      },
    }),
  };

  return (
    <section
      id="testimonials"
      className="py-[60px] lg:py-[120px] px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden relative z-10"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-12 lg:mb-16">
        <span className="font-[600] text-[10px] md:text-[12px] tracking-[0.2em] text-primary uppercase font-body">
          TESTIMONIALS
        </span>
        <h2 className="font-display text-[28px] md:text-[48px] font-bold leading-tight">
          What Colleagues & Mentors Say
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto flex items-center justify-center min-h-[380px] sm:min-h-[300px]">
        {/* Carousel controls */}
        {testimonials.length > 1 && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20 px-2 sm:-px-8">
            <button
              onClick={handlePrev}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-card hover:bg-white/10 text-on-surface hover:text-primary transition-all flex items-center justify-center cursor-pointer pointer-events-auto active:scale-90"
              aria-label="Previous testimonial"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-card hover:bg-white/10 text-on-surface hover:text-primary transition-all flex items-center justify-center cursor-pointer pointer-events-auto active:scale-90"
              aria-label="Next testimonial"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}

        <div className="w-full px-6 sm:px-16 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass-card rounded-[32px] p-8 sm:p-12 md:p-16 flex flex-col justify-between space-y-8 select-none w-full"
            >
              <div className="relative">
                <span className="material-symbols-outlined text-primary/20 text-6xl md:text-7xl font-light absolute -top-8 -left-4 sm:-left-8 pointer-events-none select-none">
                  format_quote
                </span>
                <p className="font-body text-on-surface-variant text-[15px] sm:text-[18px] leading-[1.7] italic relative z-10 pl-2">
                  {activeTestimonial.content}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4">
                  {activeTestimonial.avatarUrl ? (
                    <img
                      src={activeTestimonial.avatarUrl}
                      alt={activeTestimonial.name}
                      className="w-14 h-14 rounded-full object-cover bg-white/5 border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base tracking-wider shrink-0 select-none">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-on-surface text-[16px] sm:text-[18px]">
                      {activeTestimonial.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      {activeTestimonial.role}
                      {activeTestimonial.company ? (
                        <>
                          <span className="text-primary/50 mx-1.5">•</span>
                          {activeTestimonial.company}
                        </>
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                </div>

                {testimonials.length > 1 && (
                  <div className="flex gap-2 justify-center sm:justify-start">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDirection(i > activeIndex ? 1 : -1);
                          setActiveIndex(i);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
