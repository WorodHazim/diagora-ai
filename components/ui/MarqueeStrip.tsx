"use client";

import React from "react";
import { motion } from "framer-motion";

const words = [
  "AI MEDICAL BOARD",
  "✦",
  "MULTI-AGENT REASONING",
  "✦",
  "EVIDENCE-GROUNDED",
  "✦",
  "SAFER DECISIONS",
  "✦"
];

// Duplicate to ensure seamless looping
const marqueeContent = [...words, ...words, ...words, ...words];

export function MarqueeStrip() {
  return (
    <div className="w-full bg-[#030409] border-y border-white/10 overflow-hidden py-4 md:py-6 flex relative z-20">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {marqueeContent.map((word, index) => (
          <span 
            key={index} 
            className={`mx-4 text-sm md:text-base font-medium tracking-[0.2em] ${
              word === "✦" ? "text-[#5BB6FF]" : "text-white/60"
            }`}
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
