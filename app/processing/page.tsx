"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const STEPS = [
  "Analyzing clinical parameters...",
  "Cross-referencing medical databases...",
  "Activating specialist agents...",
  "Preparing debate environment..."
];

export default function ProcessingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const nextStep = (index: number) => {
      if (index < STEPS.length) {
        setCurrentStep(index);
        // Each step takes 700ms
        timeout = setTimeout(() => nextStep(index + 1), 700);
      } else {
        // Finally navigate to debate
        timeout = setTimeout(() => {
          router.push("/debate");
        }, 300);
      }
    };

    // Small initial delay
    timeout = setTimeout(() => nextStep(0), 400);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="relative w-full h-screen bg-[#050711] overflow-hidden font-sans flex flex-col items-center justify-center">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_#050711_80%)] pointer-events-none" />

      {/* Orbiting Particles SVG */}
      <svg className="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none opacity-50">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "400px 400px" }}
        >
          <circle cx="400" cy="400" r="150" fill="none" stroke="rgba(129, 140, 248, 0.1)" strokeWidth="1" strokeDasharray="4 12" />
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <circle 
                key={`p1-${i}`}
                cx={400 + Math.cos(rad) * 150} cy={400 + Math.sin(rad) * 150} r="2" 
                fill="#818CF8" filter="url(#glow)"
              />
            )
          })}
        </motion.g>

        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "400px 400px" }}
        >
          <circle cx="400" cy="400" r="220" fill="none" stroke="rgba(165, 180, 252, 0.05)" strokeWidth="1" strokeDasharray="2 20" />
          {[45, 135, 225, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <circle 
                key={`p2-${i}`}
                cx={400 + Math.cos(rad) * 220} cy={400 + Math.sin(rad) * 220} r="3" 
                fill="#A5B4FC" filter="url(#glow)"
              />
            )
          })}
        </motion.g>

        {/* Central neural lines pulsing outwards */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <motion.line
              key={`line-${angle}`}
              x1="400" y1="400"
              x2={400 + Math.cos(rad) * 250} y2={400 + Math.sin(rad) * 250}
              stroke="rgba(129, 140, 248, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 8"
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: angle / 100 }}
            />
          )
        })}
      </svg>

      {/* Central Core */}
      <div className="relative z-20 w-64 h-64 flex items-center justify-center mb-16">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-indigo-500/20 blur-[40px]"
        />
        <motion.div 
          animate={{ 
            boxShadow: "0 0 80px -10px rgba(129,140,248,0.8)"
          }}
          className="absolute w-28 h-28 rounded-full bg-[#03040A] border border-white/20 flex items-center justify-center backdrop-blur-3xl"
        >
          <motion.div 
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-full bg-indigo-400/50 blur-[10px]"
          />
        </motion.div>
      </div>

      {/* Text Container */}
      <div className="relative z-30 h-20 flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {currentStep < STEPS.length && (
            <motion.h2
              key={currentStep}
              initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-light tracking-wide text-white/90"
            >
              {STEPS[currentStep]}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
