"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface NyraEntityProps {
  state: "idle" | "listening" | "thinking" | "speaking" | "greeting" | "farewell";
}

export default function NyraEntity({ state }: NyraEntityProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Update ref to avoid rebuilding Three scene on prop updates
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Track mouse coordinates for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x: x * 0.5, y: y * 0.5 };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 160;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold all objects for rotation/parallax
    const group = new THREE.Group();
    scene.add(group);

    // 1. Core glass/emissive nucleus
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 4);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f3ff,
      emissive: 0x0055ff,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
      transmission: 0.6,
      thickness: 1.2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 2. Wireframe shell for futuristic OS detail
    const shellGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);

    // 3. Orbiting Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialRadii: number[] = [];
    const angles: number[] = [];
    const speeds: number[] = [];
    const yOffsets: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 0.4;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.01 + Math.random() * 0.02;
      const yOffset = (Math.random() - 0.5) * 0.5;

      initialRadii.push(radius);
      angles.push(angle);
      speeds.push(speed);
      yOffsets.push(yOffset);

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = yOffset;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 2, 5);
    pointLight.position.set(0, 0, 1.2);
    scene.add(pointLight);

    camera.position.z = 2.4;

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Base rotations
      core.rotation.y += 0.005;
      core.rotation.x += 0.003;
      shell.rotation.y -= 0.003;

      // Parallax mouse follow (with natural vertical orientation)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseRef.current.x, 0.08);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -mouseRef.current.y, 0.08);

      // Animate particles based on current state
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      const positionsArray = posAttr.array as Float32Array;

      let speedMultiplier = 1.0;
      let radiusOscillation = 0.0;
      let yScatter = 0.0;

      if (currentState === "listening") {
        speedMultiplier = 2.2;
        radiusOscillation = Math.sin(elapsed * 12) * 0.15;
        // Pulse colors to cyan-white
        coreMat.color.setHex(0xffffff);
        coreMat.emissive.setHex(0x00ffff);
        coreMat.emissiveIntensity = 2.5 + Math.sin(elapsed * 15) * 0.5;
        particleMat.color.setHex(0x00ffff);
        pointLight.color.setHex(0x00ffff);
        pointLight.intensity = 3.0;
      } else if (currentState === "thinking") {
        speedMultiplier = 3.0;
        yScatter = Math.sin(elapsed * 8) * 0.25;
        // Pulse colors to deep purple/magenta
        coreMat.color.setHex(0x8b5cf6);
        coreMat.emissive.setHex(0xec4899);
        coreMat.emissiveIntensity = 2.0 + Math.sin(elapsed * 20) * 0.8;
        particleMat.color.setHex(0xec4899);
        pointLight.color.setHex(0x8b5cf6);
        pointLight.intensity = 2.5;
      } else if (currentState === "speaking") {
        speedMultiplier = 1.5;
        // Core breathing syncs with audio waveform simulation
        const speakMod = Math.abs(Math.sin(elapsed * 25) * Math.cos(elapsed * 10));
        core.scale.setScalar(1.0 + speakMod * 0.15);
        coreMat.color.setHex(0x00f3ff);
        coreMat.emissive.setHex(0x3b82f6);
        coreMat.emissiveIntensity = 1.5 + speakMod * 2.0;
        particleMat.color.setHex(0x3b82f6);
        pointLight.color.setHex(0x00f3ff);
        pointLight.intensity = 1.5 + speakMod * 1.5;
      } else if (currentState === "greeting") {
        // Pulse gently, slightly brighter/faster than idle
        const breath = 1.0 + Math.sin(elapsed * 4.0) * 0.06;
        core.scale.setScalar(breath);
        coreMat.color.setHex(0x00f3ff);
        coreMat.emissive.setHex(0x00aaff);
        coreMat.emissiveIntensity = 2.0 + Math.sin(elapsed * 4.0) * 0.4;
        particleMat.color.setHex(0x00f3ff);
        pointLight.color.setHex(0x00f3ff);
        pointLight.intensity = 2.0;
      } else if (currentState === "farewell") {
        // Softly dim the core
        core.scale.setScalar(0.95);
        coreMat.color.setHex(0x00aaff);
        coreMat.emissive.setHex(0x0033aa);
        coreMat.emissiveIntensity = 0.5;
        particleMat.color.setHex(0x0055aa);
        pointLight.color.setHex(0x0055aa);
        pointLight.intensity = 0.5;
      } else {
        // Idle state breathing & parallax
        const breath = 1.0 + Math.sin(elapsed * 2.5) * 0.04;
        core.scale.setScalar(breath);
        coreMat.color.setHex(0x00f3ff);
        coreMat.emissive.setHex(0x0055ff);
        coreMat.emissiveIntensity = 1.5 + Math.sin(elapsed * 2.5) * 0.25;
        particleMat.color.setHex(0x00f3ff);
        pointLight.color.setHex(0x00f3ff);
        pointLight.intensity = 1.5;
      }

      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i] * speedMultiplier;
        const currentRadius = initialRadii[i] + radiusOscillation;
        
        positionsArray[i * 3] = Math.cos(angles[i]) * currentRadius;
        positionsArray[i * 3 + 1] = yOffsets[i] + (currentState === "thinking" ? Math.sin(angles[i] * 3 + elapsed * 5) * yScatter : 0);
        positionsArray[i * 3 + 2] = Math.sin(angles[i]) * currentRadius;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative" />;
}
