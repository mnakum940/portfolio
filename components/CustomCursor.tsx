"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // The outer ring trails the dot via spring physics
  const ringX = useSpring(cursorX, { damping: 22, stiffness: 280, mass: 0.5 });
  const ringY = useSpring(cursorY, { damping: 22, stiffness: 280, mass: 0.5 });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMouse, setHasMouse] = useState(false);

  // Ref to track values inside the animation loop without resetting it
  const isVisibleRef = useRef(false);
  const isHoveringRef = useRef(false);
  const isClickingRef = useRef(false);

  // Keep refs synchronized
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useEffect(() => {
    isClickingRef.current = isClicking;
  }, [isClicking]);

  // Trail dots state
  const trailRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const positions = useRef<{ x: number; y: number }[]>(
    Array.from({ length: 6 }, () => ({ x: -100, y: -100 }))
  );
  const animFrameRef = useRef<number>(0);

  // Handle dynamic cursor detection (mouse vs touch)
  useEffect(() => {
    // Check initially
    const mql = window.matchMedia("(pointer: fine)");
    if (mql.matches) {
      setHasMouse(true);
    }

    const handleMouseMove = () => {
      setHasMouse(true);
    };

    const handleTouchStart = () => {
      setHasMouse(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Trail animation loop — each dot follows the one ahead of it
  useEffect(() => {
    if (!hasMouse) return;

    const animate = () => {
      const dots = dotsRef.current;
      const pos = positions.current;

      // First dot follows the real cursor
      pos[0].x += (cursorX.get() - pos[0].x) * 0.35;
      pos[0].y += (cursorY.get() - pos[0].y) * 0.35;

      for (let i = 1; i < pos.length; i++) {
        pos[i].x += (pos[i - 1].x - pos[i].x) * 0.25;
        pos[i].y += (pos[i - 1].y - pos[i].y) * 0.25;
      }

      dots.forEach((dot, i) => {
        if (dot) {
          dot.style.transform = `translate3d(${pos[i].x - 2.5}px, ${pos[i].y - 2.5}px, 0)`;
          dot.style.opacity = isVisibleRef.current ? `${0.35 - i * 0.05}` : "0";
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [hasMouse, cursorX, cursorY]);

  // Mouse coordinate and state listeners
  useEffect(() => {
    if (!hasMouse) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisibleRef.current) setIsVisible(true);
    };
    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    // Hover detection via event delegation (very high performance)
    const onOverCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, [role="button"], input, textarea, select, .glass-card, [data-cursor="pointer"]'
        )
      ) {
        setIsHovering(true);
      }
    };
    const onOutCapture = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (
        !related ||
        !related.closest(
          'a, button, [role="button"], input, textarea, select, .glass-card, [data-cursor="pointer"]'
        )
      ) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mouseover", onOverCapture, { passive: true });
    document.addEventListener("mouseout", onOutCapture, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onOverCapture);
      document.removeEventListener("mouseout", onOutCapture);
    };
  }, [hasMouse, cursorX, cursorY]);

  if (!hasMouse) return null;

  const dotSize = isClicking ? 6 : isHovering ? 14 : 8;
  const ringSize = isClicking ? 24 : isHovering ? 50 : 36;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (pointer: fine) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }
      `,
        }}
      />

      {/* Trail dots */}
      <div ref={trailRef} className="fixed inset-0 pointer-events-none z-[9997]">
        {positions.current.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            className="fixed top-0 left-0 pointer-events-none"
            style={{
              width: 5 - i * 0.5,
              height: 5 - i * 0.5,
              borderRadius: "50%",
              background: `rgba(163, 201, 255, ${0.35 - i * 0.05})`,
              opacity: 0,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Outer ring — spring delayed */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderStyle: "solid",
          borderColor: isHovering
            ? "rgba(163, 201, 255, 0.5)"
            : "rgba(255, 255, 255, 0.3)",
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: isVisible ? 1 : 0,
          borderWidth: isHovering ? 2 : 1.5,
        }}
        transition={{
          width: { type: "spring", damping: 20, stiffness: 300 },
          height: { type: "spring", damping: 20, stiffness: 300 },
          opacity: { duration: 0.15 },
        }}
      />

      {/* Inner dot — follows mouse exactly */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          background: isHovering
            ? "rgba(163, 201, 255, 1)"
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: isHovering
            ? "0 0 20px rgba(163, 201, 255, 0.5), 0 0 40px rgba(163, 201, 255, 0.15)"
            : "0 0 6px rgba(255, 255, 255, 0.15)",
        }}
        animate={{
          width: dotSize,
          height: dotSize,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          width: { type: "spring", damping: 25, stiffness: 400 },
          height: { type: "spring", damping: 25, stiffness: 400 },
          opacity: { duration: 0.15 },
        }}
      />
    </>
  );
}
