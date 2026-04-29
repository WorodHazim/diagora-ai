"use client";

import React from "react";
import { motion } from "framer-motion";

export function DataWave({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mix-blend-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      <svg className="w-full h-full absolute" viewBox="0 0 1000 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#070A18" stopOpacity="0" />
            <stop offset="30%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#A5B4FC" stopOpacity="1" />
            <stop offset="70%" stopColor="#818CF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#070A18" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Create 3 delicate layered waves for depth */}
        {[...Array(3)].map((_, i) => (
          <motion.path
            key={`wave-${i}`}
            d={`M 0 250 C 300 ${150 + i * 40}, 700 ${350 - i * 40}, 1000 250`}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth={0.5 + i * 0.2}
            animate={{
              d: [
                `M 0 250 C 300 ${150 + i * 40}, 700 ${350 - i * 40}, 1000 250`,
                `M 0 250 C 400 ${350 - i * 40}, 600 ${150 + i * 40}, 1000 250`,
                `M 0 250 C 300 ${150 + i * 40}, 700 ${350 - i * 40}, 1000 250`
              ]
            }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.4 + i * 0.2 }}
          />
        ))}

        {/* Tiny elegant moving particles along the horizontal span */}
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={`wave-particle-${i}`}
            r={Math.random() * 0.8 + 0.4}
            fill="#FFF"
            cx="0"
            cy="250"
            animate={{
              cx: ["0%", "100%"],
              cy: [
                250 + Math.sin(i) * 50,
                250 - Math.sin(i) * 50,
                250 + Math.cos(i) * 50
              ],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
