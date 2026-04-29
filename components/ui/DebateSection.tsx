"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, Brain, FlaskConical, ShieldAlert, Wind } from "lucide-react";

const AGENTS = [
  { id: "cardio", agent: "Cardiologist", text: "Possible ACS", icon: Activity, color: "#60A5FA", angle: -90 },
  { id: "pulmo", agent: "Pulmonologist", text: "Could be PE", icon: Wind, color: "#818CF8", angle: -18 },
  { id: "labs", agent: "Labs Agent", text: "Troponin elevated", icon: FlaskConical, color: "#C4B5FD", angle: 54 },
  { id: "neuro", agent: "Neurologist", text: "Unlikely stroke", icon: Brain, color: "#A5B4FC", angle: 126 },
  { id: "risk", agent: "Risk Agent", text: "High risk detected", icon: ShieldAlert, color: "#F97316", angle: 198, isAlert: true },
];

export function DebateSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[1000px] lg:h-[1000px] bg-[#050711] overflow-hidden font-sans border-b border-white/5 flex flex-col lg:flex-row items-center"
    >
      {/* Deep cinematic background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.03)_0%,_#050711_80%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.05)_0%,_transparent_50%)] rounded-full blur-[100px] pointer-events-none" />

      {/* Faint Orbital Grid Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-indigo-500/10" />
        <div className="absolute w-[900px] h-[900px] rounded-full border border-indigo-500/10" />
        <div className="absolute w-[1200px] h-[1200px] rounded-full border border-indigo-500/5" />
      </div>

      {/* Left Text Block */}
      <div className="relative w-full lg:w-[40%] z-30 px-6 py-20 lg:py-0 lg:pl-16 xl:pl-24 flex flex-col justify-center shrink-0">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-md xl:max-w-lg"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8 backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818CF8]" />
            <span className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase">
              Live Medical Board
            </span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
            AI Agents<br />Debate Live
          </h2>
          <p className="text-xl text-white/40 font-light leading-relaxed">
            Multiple specialists analyze the case, challenge assumptions, and surface hidden risks.
          </p>
        </motion.div>
      </div>

      {/* Right Network Visualization */}
      <div className="relative w-full lg:w-[60%] h-[700px] lg:h-full z-10 flex items-center justify-center shrink-0">
        
        {/* Connection Lines & Particles */}
        <svg className="absolute w-[1000px] h-[1000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none">
          <defs>
            <filter id="glowLine">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Orbital rings */}
          <motion.circle 
            cx="500" cy="500" r="320" 
            fill="none" stroke="rgba(165, 180, 252, 0.08)" strokeWidth="1" strokeDasharray="2 12"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1, rotate: 360 } : { opacity: 0, rotate: 0 }}
            transition={{ opacity: { duration: 2 }, rotate: { duration: 100, repeat: Infinity, ease: "linear" } }}
            style={{ transformOrigin: "500px 500px" }}
          />
          <motion.circle 
            cx="500" cy="500" r="220" 
            fill="none" stroke="rgba(96, 165, 250, 0.08)" strokeWidth="1" strokeDasharray="4 24"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1, rotate: -360 } : { opacity: 0, rotate: 0 }}
            transition={{ opacity: { duration: 2 }, rotate: { duration: 80, repeat: Infinity, ease: "linear" } }}
            style={{ transformOrigin: "500px 500px" }}
          />

          {/* Lines connecting to center */}
          {AGENTS.map((agent, i) => {
            const radius = 320;
            const rad = (agent.angle * Math.PI) / 180;
            const startX = 500 + Math.cos(rad) * radius;
            const startY = 500 + Math.sin(rad) * radius;
            const cx = 500 + Math.cos(rad) * 150;
            const cy = 500 + Math.sin(rad) * 150;
            const pathD = `M ${startX} ${startY} Q ${cx} ${cy} 500 500`;
            const isHovered = hoveredAgent === agent.id;

            return (
              <g key={`connection-${agent.id}`}>
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={agent.isAlert ? (isHovered ? "#F97316" : "rgba(249, 115, 22, 0.5)") : (isHovered ? "#818CF8" : "rgba(129, 140, 248, 0.3)")}
                  strokeWidth={isHovered ? 4 : 2}
                  filter="url(#glowLine)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.3, ease: "easeInOut" }}
                  className="transition-all duration-300"
                />
                
                {/* Animated data particle traveling along the line */}
                {isInView && (
                  <motion.circle
                    r={isHovered ? 5 : 3}
                    fill={agent.isAlert ? "#F97316" : "#A5B4FC"}
                    filter="url(#glowLine)"
                    animate={{
                      offsetDistance: ["0%", "100%"],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random(),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5 + i * 0.3
                    }}
                    style={{ offsetPath: `path('${pathD}')` }}
                    className="transition-all duration-300"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central AI Core */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute z-20 w-[300px] h-[300px] flex items-center justify-center pointer-events-none"
        >
          {/* Pulsing Core Rings */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-indigo-500/20 blur-[40px]"
          />
          <div className="absolute w-40 h-40 rounded-full bg-[#03040A] border border-indigo-400/40 flex items-center justify-center shadow-[0_0_80px_-10px_rgba(129,140,248,0.7)] backdrop-blur-3xl">
            <div className="w-16 h-16 rounded-full bg-indigo-300/40 blur-[10px] animate-pulse" />
          </div>
        </motion.div>

        {/* Orbiting Agents and Messages */}
        {AGENTS.map((agent, i) => {
          const radius = 320;
          const rad = (agent.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const Icon = agent.icon;
          const delay = 1 + i * 0.3;
          const isHovered = hoveredAgent === agent.id;
          
          return (
            <div
              key={agent.id}
              className="absolute z-30 flex items-center justify-center"
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              {/* Agent Node */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay, ease: "easeOut" }}
                className="relative cursor-pointer"
              >
                <motion.div 
                  animate={{ y: isHovered ? 0 : [0, -5, 0], scale: isHovered ? 1.1 : 1 }}
                  transition={{ 
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 },
                    scale: { duration: 0.2 }
                  }}
                  className={`w-20 h-20 rounded-full border backdrop-blur-xl flex flex-col items-center justify-center relative transition-all duration-300
                    ${isHovered 
                      ? 'bg-white/10 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.15)]' 
                      : 'bg-white/[0.03] border-white/20 shadow-xl'}`}
                >
                  <Icon 
                    className="w-7 h-7 mb-1" 
                    style={{ color: agent.isAlert && isInView ? "#F97316" : agent.color }} 
                  />
                  <span className="text-[10px] font-semibold text-white/80 tracking-widest uppercase">{agent.id}</span>
                  
                  {/* Alert glow ring */}
                  {agent.isAlert && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: [0, 1, 0], scale: [1, 1.5, 1] } : {}}
                      transition={{ duration: 2, delay: delay + 0.5, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full border border-orange-500/50 ${isHovered ? 'border-2' : ''}`}
                    />
                  )}
                </motion.div>
              </motion.div>

              {/* Message Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: agent.angle > 0 && agent.angle < 180 ? 20 : -20 }}
                animate={isInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: delay + 0.5, ease: "easeOut" }}
                className={`absolute w-max max-w-[250px] z-40 pointer-events-auto cursor-default ${
                  agent.angle > -90 && agent.angle < 90 
                    ? "left-full ml-6" 
                    : "right-full mr-6" 
                }`}
                style={{ top: "50%", transform: "translateY(-50%)" }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                <motion.div 
                  animate={{ 
                    y: isHovered ? -5 : 0,
                    scale: isHovered ? 1.05 : 1
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`px-6 py-4 rounded-[1.5rem] border backdrop-blur-2xl transition-all duration-300
                    ${agent.isAlert 
                      ? isHovered ? "bg-orange-500/25 border-orange-500/60 text-orange-100 shadow-[0_0_30px_rgba(249,115,22,0.4)]" : "bg-orange-500/10 border-orange-500/30 text-orange-200 shadow-2xl" 
                      : isHovered ? "bg-[#0A0D20] border-indigo-400/40 text-white shadow-[0_0_30px_rgba(129,140,248,0.3)]" : "bg-[#0A0D20]/80 border-indigo-500/20 text-white/90 shadow-2xl"}`}
                >
                  <div className={`text-[11px] font-bold tracking-[0.1em] mb-1 uppercase ${agent.isAlert ? 'text-orange-300/80' : 'text-indigo-300/80'}`}>
                    {agent.agent}
                  </div>
                  <div className="text-lg tracking-wide font-medium leading-tight">
                    {agent.text}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
