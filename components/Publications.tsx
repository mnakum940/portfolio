"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStoredPublications, Publication, DEFAULT_PUBLICATIONS } from "../utils/db";

export default function Publications() {
  const [papers, setPapers] = useState<Publication[]>(DEFAULT_PUBLICATIONS);

  const [isSpotlit, setIsSpotlit] = useState(false);

  useEffect(() => {
    const loadPubs = () => {
      const all = getStoredPublications();
      setPapers(all.filter((p) => p.status === "PUBLISHED"));
    };
    loadPubs();

    const handleSync = () => {
      loadPubs();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("publications_updated", handleSync);

    const handleSpotlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === "publications") {
        setIsSpotlit(true);
        setTimeout(() => setIsSpotlit(false), 3000);
      }
    };
    window.addEventListener("spotlight_section", handleSpotlight);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("publications_updated", handleSync);
      window.removeEventListener("spotlight_section", handleSpotlight);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section 
      id="publications"
      className={`pb-[60px] lg:pb-[120px] px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden relative z-10 transition-all duration-700 rounded-3xl ${
        isSpotlit ? "ring-2 ring-primary/60 bg-primary/5 shadow-[0_0_50px_rgba(163,201,255,0.3)] scale-[1.01]" : ""
      }`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      >
        {papers.map((paper) => (
          <motion.div
            key={paper.id}
            variants={cardVariants}
            className="glass-card p-6 lg:p-10 rounded-2xl lg:rounded-[40px] space-y-4 lg:space-y-6 flex flex-col justify-between hover:border-primary/30 transition-colors duration-300 shadow-xl"
          >
            <div className="space-y-4 lg:space-y-6">
              <span className="inline-block px-2.5 py-0.5 lg:px-3 lg:py-1 bg-surface-variant text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold rounded-full text-on-surface-variant uppercase">
                {paper.venue}
              </span>
              <h3 className="font-display text-[18px] md:text-[28px] font-bold leading-snug">
                {paper.title}
              </h3>
              <p className="text-on-surface-variant font-body text-sm lg:text-base leading-[1.6]">
                {paper.abstract}
              </p>
            </div>
            
            <a
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline w-fit self-start pt-2 text-sm lg:text-base"
              href={paper.link}
            >
              Read Paper
              <span className="material-symbols-outlined text-[14px] lg:text-[16px]">
                open_in_new
              </span>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
