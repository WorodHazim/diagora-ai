"use client";

import React from "react";
import { motion } from "framer-motion";

export function BigStatementSection() {
  return (
    <section className="relative w-full py-48 bg-[#050711] overflow-hidden flex items-center justify-center border-b border-white/5">
      
      {/* Subtle parallax background glow */}
      <motion.div 
        className="absolute w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #A78BFA 0%, transparent 60%)",
        }}
        initial={{ y: 100 }}
        whileInView={{ y: -100 }}
        viewport={{ margin: "10%" }}
        transition={{ duration: 2, ease: "linear" }}
      />
      
      <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white leading-[1.1]"
        >
          Not one answer.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5BB6FF] via-[#7B8CFF] to-[#D946EF]">
            A medical board that thinks together.
          </span>
        </motion.h2>
      </div>
    </section>
  );
}
