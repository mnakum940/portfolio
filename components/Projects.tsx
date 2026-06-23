"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { getStoredProjects, Project, DEFAULT_PROJECTS, formatExternalLink } from "../utils/db";

export default function Projects() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [isMobile, setIsMobile] = useState(true);

  const [isSpotlit, setIsSpotlit] = useState(false);

  useEffect(() => {
    const loadProjects = () => {
      const all = getStoredProjects();
      // Only display LIVE and BETA status projects on the public homepage (ARCHIVED are hidden)
      setProjects(all.filter((p) => p.status !== "ARCHIVED"));
    };
    loadProjects();

    const handleSync = () => {
      loadProjects();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("projects_updated", handleSync);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleSpotlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === "projects") {
        setIsSpotlit(true);
        setTimeout(() => setIsSpotlit(false), 3000);
      }
    };
    window.addEventListener("spotlight_section", handleSpotlight);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("projects_updated", handleSync);
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("spotlight_section", handleSpotlight);
    };
  }, []);

  // Parallax effects for the project cards
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yShiftEven = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yShiftOdd = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      ref={containerRef}
      className={`py-[60px] lg:py-[120px] px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto space-y-12 lg:space-y-20 overflow-hidden transition-all duration-700 rounded-3xl ${
        isSpotlit ? "ring-2 ring-primary/60 bg-primary/5 shadow-[0_0_50px_rgba(163,201,255,0.3)] scale-[1.01]" : ""
      }`}
      id="projects"
    >
      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center space-y-4"
      >
        <span className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-primary uppercase">
          FEATURED WORK
        </span>
        <h2 className="font-display text-[28px] md:text-[48px] font-semibold leading-[1.2] letter-spacing-[-0.02em]">
          Intelligence in Production
        </h2>
      </motion.div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-8 lg:gap-12">
        {projects.map((proj, index) => {
          const isLeft = index % 2 === 0;
          const yParallax = isLeft ? yShiftEven : yShiftOdd;

          return (
            <motion.div
              key={proj.id}
              style={{ y: isMobile ? 0 : yParallax }}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card rounded-[24px] lg:rounded-[40px] overflow-hidden group shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {isLeft ? (
                  <>
                    <div className="lg:col-span-7 p-6 md:p-12 space-y-6 lg:space-y-8 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-xl lg:text-2xl">
                              psychology
                            </span>
                          </span>
                          <h3 className="font-display text-[22px] md:text-[40px] font-bold leading-tight">
                            {proj.title}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 lg:px-3 lg:py-1 glass-card rounded-full text-[9px] lg:text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                          proj.status === "LIVE" 
                            ? "text-primary border-primary/20 bg-primary/5" 
                            : "text-tertiary border-tertiary/20 bg-tertiary/5"
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="font-body text-[15px] md:text-[18px] text-on-surface-variant leading-[1.6]">
                        {proj.desc}
                      </p>
                      {proj.tags.length > 0 && (
                        <ul className="space-y-2 lg:space-y-3">
                          {proj.tags.map((tag) => (
                            <li key={tag} className="flex items-center gap-3 text-on-surface-variant text-sm lg:text-base">
                              <span className="material-symbols-outlined text-primary text-base lg:text-lg shrink-0">
                                check_circle
                              </span>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-4 pt-2">
                        <a
                          href={formatExternalLink(proj.link)}
                          className="px-5 py-2.5 lg:px-6 lg:py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform active:scale-95 text-center flex items-center justify-center text-sm lg:text-base"
                        >
                          Explore {proj.title}
                        </a>
                      </div>
                    </div>
                    <div className="lg:col-span-5 relative h-[250px] lg:h-auto min-h-[250px] lg:min-h-[400px] overflow-hidden">
                      <motion.img
                        alt={proj.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        src={proj.imageUrl}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#07090D] via-[#07090D]/50 lg:from-transparent pointer-events-none" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lg:col-span-5 relative h-[250px] lg:h-auto min-h-[250px] lg:min-h-[400px] order-last lg:order-first overflow-hidden">
                      <motion.img
                        alt={proj.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        src={proj.imageUrl}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-[#07090D] via-[#07090D]/50 lg:from-transparent pointer-events-none" />
                    </div>
                    <div className="lg:col-span-7 p-6 md:p-12 space-y-6 lg:space-y-8 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-tertiary/20 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-tertiary text-xl lg:text-2xl">
                              shield_lock
                            </span>
                          </span>
                          <h3 className="font-display text-[22px] md:text-[40px] font-bold leading-tight">
                            {proj.title}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 lg:px-3 lg:py-1 glass-card rounded-full text-[9px] lg:text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                          proj.status === "LIVE" 
                            ? "text-primary border-primary/20 bg-primary/5" 
                            : "text-tertiary border-tertiary/20 bg-tertiary/5"
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="font-body text-[15px] md:text-[18px] text-on-surface-variant leading-[1.6]">
                        {proj.desc}
                      </p>
                      {proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 lg:gap-2">
                          {proj.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 bg-surface-variant text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold rounded-full text-on-surface-variant uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 pt-2">
                        <a
                          href={formatExternalLink(proj.link)}
                          className="px-5 py-2.5 lg:px-6 lg:py-3 bg-tertiary text-on-tertiary font-bold rounded-xl hover:scale-105 transition-transform active:scale-95 text-center flex items-center justify-center text-sm lg:text-base"
                        >
                          Explore {proj.title}
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
