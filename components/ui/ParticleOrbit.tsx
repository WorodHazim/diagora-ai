"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

export function ParticleOrbit() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 40 }).map((_, i) => {
      // Create a perfect circular distribution
      const angle = (i / 40) * Math.PI * 2;
      const radius = 300 + Math.random() * 60 - 30;
      const x = 500 + Math.cos(angle) * radius;
      const y = 500 + Math.sin(angle) * radius;
      const size = Math.random() * 1.5 + 0.5;
      const duration = 30 + Math.random() * 20;
      const color = Math.random() > 0.5 ? "#60A5FA" : "#A5B4FC";
      const opacity = Math.random() * 0.4 + 0.1;
      
      return { x, y, size, duration, color, opacity, angle };
    });
  }, [isMounted]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
    >
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        {/* Soft, thin orbital paths */}
        <motion.circle
          cx="500" cy="500" r="300"
          fill="none" stroke="rgba(96, 165, 250, 0.15)" strokeWidth="0.5"
          strokeDasharray="4 16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          style={{ transformOrigin: "500px 500px" }}
        />
        <motion.circle
          cx="500" cy="500" r="330"
          fill="none" stroke="rgba(165, 180, 252, 0.1)" strokeWidth="0.5"
          strokeDasharray="2 20"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
          style={{ transformOrigin: "500px 500px" }}
        />

        {/* Delicate Particles */}
        {particles.map((p, i) => (
          <motion.circle
            key={i}
            r={p.size}
            fill={p.color}
            opacity={p.opacity}
            style={{ transformOrigin: "500px 500px" }}
            initial={{ cx: p.x, cy: p.y }}
            animate={{ rotate: 360 }}
            transition={{
              rotate: { repeat: Infinity, duration: p.duration, ease: "linear" }
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
