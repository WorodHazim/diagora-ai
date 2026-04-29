"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="bg-[#030409] py-40 relative font-sans flex items-center justify-center overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center flex flex-col items-center px-6"
      >
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-10">
          Start your first clinical board.
        </h2>
        
        <Link href="/new-case">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(91, 182, 255, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-white text-black rounded-full font-medium text-lg tracking-wide flex items-center gap-3 transition-colors hover:bg-zinc-200"
          >
            Launch Diagora
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
