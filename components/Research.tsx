"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Research() {
  const [isSpotlit, setIsSpotlit] = useState(false);

  useEffect(() => {
    const handleSpotlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === "research") {
        setIsSpotlit(true);
        setTimeout(() => setIsSpotlit(false), 3000);
      }
    };
    window.addEventListener("spotlight_section", handleSpotlight);
    return () => {
      window.removeEventListener("spotlight_section", handleSpotlight);
    };
  }, []);

  const domains = [
    { name: "Agentic AI", icon: "robot_2", color: "text-primary" },
    { name: "LLM Security", icon: "verified_user", color: "text-tertiary" },
    { name: "Multimodal Systems", icon: "layers", color: "text-primary" },
    { name: "MLOps", icon: "cloud_done", color: "text-tertiary" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      className={`py-[60px] lg:py-[120px] px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden relative z-10 transition-all duration-700 rounded-3xl ${
        isSpotlit ? "ring-2 ring-primary/60 bg-primary/5 shadow-[0_0_50px_rgba(163,201,255,0.3)] scale-[1.01]" : ""
      }`}
      id="research"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center space-y-6 lg:space-y-8"
      >
        <h2 className="font-display text-[28px] md:text-[48px] font-semibold leading-[1.2] letter-spacing-[-0.02em]">
          Core Research Domains
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
          {domains.map((domain) => (
            <motion.div
              key={domain.name}
              variants={itemVariants}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="glass-card px-6 py-4 lg:px-8 lg:py-6 rounded-2xl lg:rounded-3xl cursor-pointer group flex flex-col items-center min-w-[130px] lg:min-w-[160px]"
            >
              <span
                className={`material-symbols-outlined ${domain.color} mb-3 lg:mb-4 block text-3xl lg:text-4xl group-hover:scale-110 transition-transform`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {domain.icon}
              </span>
              <p className="font-bold text-center text-sm lg:text-base">{domain.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
