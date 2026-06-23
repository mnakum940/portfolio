"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStoredExperiences, DEFAULT_EXPERIENCES, ExperienceItem } from "../utils/db";

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(DEFAULT_EXPERIENCES);

  const [isSpotlit, setIsSpotlit] = useState(false);

  useEffect(() => {
    setExperiences(getStoredExperiences());

    const handleSync = () => {
      setExperiences(getStoredExperiences());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("settings_updated", handleSync);

    const handleSpotlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === "experience") {
        setIsSpotlit(true);
        setTimeout(() => setIsSpotlit(false), 3000);
      }
    };
    window.addEventListener("spotlight_section", handleSpotlight);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("settings_updated", handleSync);
      window.removeEventListener("spotlight_section", handleSpotlight);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      className={`py-[60px] lg:py-[120px] bg-surface-container-lowest/30 relative z-10 w-full overflow-hidden transition-all duration-700 rounded-3xl ${
        isSpotlit ? "ring-2 ring-primary/60 bg-primary/5 shadow-[0_0_50px_rgba(163,201,255,0.3)] scale-[1.01]" : ""
      }`}
      id="experience"
    >
      <div className="px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* Header Description */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            <span className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-primary uppercase">
              JOURNEY
            </span>
            <h2 className="font-display text-[28px] md:text-[48px] font-semibold leading-[1.2] letter-spacing-[-0.02em]">
              Career Evolution
            </h2>
            <p className="text-on-surface-variant font-body text-[15px] lg:text-[16px]">
              From data analysis to architectural AI security.
            </p>
          </div>

          {/* Timeline Items */}
          <div className="lg:col-span-8 relative space-y-8 lg:space-y-12">
            {/* Vertical timeline line (desktop only) */}
            <div className="absolute left-8 top-0 bottom-0 w-[2px] timeline-line hidden md:block" />
            
            {experiences.map((exp) => {
              const isWork = exp.type === "WORK";
              const colorClass = isWork ? "text-primary" : "text-tertiary";
              const bgClass = isWork ? "bg-primary/10" : "bg-tertiary/10";
              const borderClass = isWork ? "hover:border-primary/30" : "hover:border-tertiary/30";
              const iconName = isWork ? "work" : "school";

              return (
                <motion.div
                  key={exp.id}
                  variants={itemVariants}
                  className="relative pl-0 md:pl-16 lg:pl-20"
                >
                  <div className="absolute left-0 top-0 w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl glass-card hidden md:flex items-center justify-center z-10">
                    <span className={`material-symbols-outlined ${colorClass} text-xl lg:text-2xl`}>
                      {iconName}
                    </span>
                  </div>
                  <div className={`glass-card p-6 md:p-8 rounded-2xl lg:rounded-3xl space-y-3 lg:space-y-4 ${borderClass} transition-colors duration-300`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <h3 className="font-display text-[20px] lg:text-[24px] font-bold">
                        {exp.company}
                      </h3>
                      <span className={`px-2.5 py-0.5 lg:px-3 lg:py-1 ${bgClass} ${colorClass} rounded-full text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold uppercase self-start md:self-auto`}>
                        {exp.period}
                      </span>
                    </div>
                    <p className={`${colorClass} font-medium text-sm lg:text-base`}>{exp.role}</p>
                    <p className="text-on-surface-variant text-[14px] lg:text-[16px] leading-[1.6]">
                      {exp.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
