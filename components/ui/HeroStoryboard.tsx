"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleOrbit } from "./ParticleOrbit";
import { AgentNode } from "./AgentNode";
import { DataWave } from "./DataWave";
import { Activity, Brain, FlaskConical, ShieldAlert, Wind } from "lucide-react";
import Link from "next/link";

const AGENT_NODES = [
  { id: "cardio", label: "", icon: Activity, color: "#60A5FA", position: { x: 0, y: -600 } },
  { id: "neuro", label: "", icon: Brain, color: "#818CF8", position: { x: 571, y: -185 } },
  { id: "pulmo", label: "", icon: Wind, color: "#A5B4FC", position: { x: 353, y: 485 } },
  { id: "labs", label: "", icon: FlaskConical, color: "#C4B5FD", position: { x: -353, y: 485 } },
  { id: "risk", label: "", icon: ShieldAlert, color: "#93C5FD", position: { x: -571, y: -185 } },
];

export function HeroStoryboard() {
  const [step, setStep] = useState(1);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let currentStep = 1;
    const interval = setInterval(() => {
      if (currentStep < 6) {
        currentStep++;
        setStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 40;
    const y = (e.clientY - rect.top - rect.height / 2) / 40;
    setMouse({ x, y });
  };

  return (
    <div 
      className="relative w-full h-[100vh] min-h-[900px] overflow-hidden bg-[#050711] font-sans"
      onMouseMove={handleMouseMove}
    >
      {/* Vignette and subtle center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#050711_100%)] z-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_0%,_transparent_60%)] rounded-full blur-[150px] pointer-events-none" />

      {/* Main cinematic container with parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
        animate={{ x: mouse.x, y: mouse.y }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {/* Background Orbits */}
        <AnimatePresence>
          {step < 3 && <ParticleOrbit key="orbit" />}
        </AnimatePresence>

        {/* Data Wave Layer */}
        <DataWave active={step >= 4} />

        {/* Central Elements */}
        <div className="relative z-30 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Brand Introduction */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 1 } }}
                className="text-center flex flex-col items-center"
              >
                <h1 className="text-[8rem] md:text-[14rem] font-semibold tracking-tighter text-white mb-6 drop-shadow-2xl">
                  Diag<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">ora</span>
                </h1>
                <p className="text-4xl md:text-6xl text-white/50 tracking-[0.2em] font-light uppercase">
                  Where Medical Minds Meet
                </p>
              </motion.div>
            )}

            {/* Step 2: The Core Sphere */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(20px)", transition: { duration: 0.8 } }}
                className="relative flex items-center justify-center w-[1800px] h-[1800px]"
              >
                <svg viewBox="0 0 1600 1600" className="absolute inset-0 w-full h-full">
                  <motion.polygon 
                    points="800,200 1371,615 1153,1285 447,1285 229,615" 
                    fill="none" 
                    stroke="rgba(165, 180, 252, 0.3)" 
                    strokeWidth="2"
                    strokeDasharray="4 16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                {/* Massive central aura */}
                <div 
                  className="w-[600px] h-[600px] rounded-full mix-blend-screen opacity-60"
                  style={{
                    background: "radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, transparent 70%)"
                  }}
                />
              </motion.div>
            )}

            {/* Step 3: AI Brain Network */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, filter: "blur(20px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(20px)", transition: { duration: 0.8 } }}
                className="relative flex items-center justify-center w-[1800px] h-[1800px]"
              >
                <svg viewBox="0 0 1600 1600" className="w-full h-full absolute inset-0 mix-blend-screen">
                  {/* Connections to nodes */}
                  {AGENT_NODES.map((node, i) => (
                    <motion.path 
                      key={`conn-${i}`}
                      d={`M 800 800 Q ${800 + (node.position.x * 0.5)} ${800 + (node.position.y * 0.5)} ${800 + node.position.x} ${800 + node.position.y}`}
                      fill="none" 
                      stroke="rgba(129, 140, 248, 0.3)" 
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  ))}
                  {/* Abstract Brain Nodes - Scaled Up */}
                  {Array.from({ length: 120 }).map((_, i) => {
                     const radius = Math.random() * 240;
                     const angle = Math.random() * Math.PI * 2;
                     const cx = 800 + Math.cos(angle) * radius * (Math.random() > 0.5 ? 1.5 : 0.8);
                     const cy = 800 + Math.sin(angle) * radius;
                     return (
                       <motion.circle 
                         key={i} 
                         cx={cx} 
                         cy={cy} 
                         r={Math.random() * 3 + 1} 
                         fill="#C4B5FD" 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: [0.1, 0.8, 0.1] }}
                         transition={{ repeat: Infinity, duration: 3 + Math.random() * 4, ease: "easeInOut" }}
                       />
                     );
                  })}
                </svg>
              </motion.div>
            )}

            {/* Step 4: Data Flow */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.8 } }}
                className="text-center z-40"
              >
                <h2 className="text-7xl md:text-9xl font-light text-white tracking-wide leading-tight">
                  Turning complex data<br/>
                  into clearer insights.
                </h2>
              </motion.div>
            )}

            {/* Step 5: The Promise */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)", transition: { duration: 0.8 } }}
                className="text-center max-w-5xl px-8 z-40"
              >
                <h2 className="text-8xl md:text-[10rem] font-light tracking-tighter text-white leading-none">
                  The future of <br/>
                  clinical reasoning.
                </h2>
              </motion.div>
            )}

            {/* Step 6: Final Persistent State */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-center flex flex-col items-center pointer-events-auto z-40"
              >
                {/* Clean D Logo for final state without blend modes */}
                <div className="relative w-48 h-48 mb-12">
                   <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                      <defs>
                        <linearGradient id="dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818CF8" />
                          <stop offset="100%" stopColor="#A5B4FC" />
                        </linearGradient>
                        <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#A78BFA" />
                          <stop offset="100%" stopColor="#D946EF" />
                        </linearGradient>
                      </defs>
                      <path d="M 25 10 L 50 10 C 75 10, 90 30, 90 50 C 90 70, 75 90, 50 90 L 25 90 Z" fill="url(#dGrad)" />
                      <circle cx="35" cy="70" r="16" fill="url(#circleGrad)" />
                   </svg>
                </div>

                <h1 className="text-[8rem] md:text-[12rem] font-semibold tracking-tighter text-white mb-6">
                  Diag<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">ora</span>
                </h1>
                <p className="text-4xl md:text-5xl text-white/50 tracking-[0.2em] font-light mb-24 uppercase">
                  Where Medical Minds Meet
                </p>

                <Link href="/new-case">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(129, 140, 248, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-20 py-8 bg-transparent border border-indigo-400/30 hover:bg-white/5 backdrop-blur-md rounded-full text-white font-medium text-3xl tracking-wide flex items-center gap-8 transition-all"
                  >
                    Start New Case
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </motion.button>
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Agents Layer (Steps 2-3) */}
        <AnimatePresence>
          {(step === 2 || step === 3) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="absolute inset-0 pointer-events-none"
            >
               {AGENT_NODES.map((node, i) => (
                 <AgentNode 
                    key={node.id}
                    {...node}
                    delay={i * 0.1}
                 />
               ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={`dot-${i}`}
            onClick={() => setStep(i)}
            className={`cursor-pointer transition-all duration-300 rounded-full ${step === i ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
