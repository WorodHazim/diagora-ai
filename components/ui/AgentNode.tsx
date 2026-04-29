"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AgentNodeProps {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
  position: { x: number; y: number };
  message?: string;
}

export function AgentNode({ id, label, icon: Icon, color, delay = 0, position, message }: AgentNodeProps) {
  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center gap-3 z-20"
      initial={{ opacity: 0, scale: 0.5, x: position.x, y: position.y }}
      animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      style={{ left: "50%", top: "50%", marginLeft: "-40px", marginTop: "-40px" }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        className="relative group w-14 h-14 md:w-16 md:h-16 flex items-center justify-center cursor-default"
      >
        {/* Very subtle background glow */}
        <div 
          className="absolute inset-0 rounded-full blur-[10px] opacity-20 transition-opacity duration-700 group-hover:opacity-40"
          style={{ backgroundColor: color }}
        />
        
        {/* Crisp glass container */}
        <div 
          className="relative w-full h-full rounded-full flex items-center justify-center bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-sm transition-all duration-500"
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color }} />
        </div>
      </motion.div>
      
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: delay + 0.5 }}
        className="text-sm font-medium tracking-wide text-zinc-300 drop-shadow-md whitespace-nowrap"
      >
        {label}
      </motion.span>

      {/* Floating Message Bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: delay + 1.5, ease: "easeOut" }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md whitespace-nowrap shadow-xl"
          style={{ boxShadow: `0 0 15px -5px ${color}` }}
        >
          <span className="text-xs tracking-wide font-light text-white drop-shadow-sm">{message}</span>
          
          {/* Small pointer tail */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/5 border-b border-r border-white/10 rotate-45 backdrop-blur-md" />
        </motion.div>
      )}
    </motion.div>
  );
}
