"use client";

import React from "react";
import { motion } from "framer-motion";

interface NodePosition {
  x: number;
  y: number;
  color: string;
}

interface NeuralConnectionsProps {
  nodes: NodePosition[];
  active: boolean;
  intensity: "low" | "high";
}

export function NeuralConnections({ nodes, active, intensity }: NeuralConnectionsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 1000">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation={intensity === "high" ? "8" : "3"} result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {nodes.map((node, i) => {
          // Calculate curve path from center (500,500) to node
          const startX = 500;
          const startY = 500;
          const endX = 500 + node.x;
          const endY = 500 + node.y;
          
          // Control point for a smooth curve
          const cx = 500 + node.x * 0.3;
          const cy = 500 + node.y * 0.8;
          
          const pathD = `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`conn-${i}`}
              d={pathD}
              fill="none"
              stroke={node.color}
              strokeWidth={intensity === "high" ? 3 : 1.5}
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                active
                  ? { pathLength: 1, opacity: intensity === "high" ? 0.8 : 0.4 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ duration: 2, ease: "easeInOut", delay: i * 0.2 }}
            />
          );
        })}

        {/* Floating connection particles */}
        {active && intensity === "high" && nodes.map((node, i) => {
          const startX = 500;
          const startY = 500;
          const endX = 500 + node.x;
          const endY = 500 + node.y;
          const cx = 500 + node.x * 0.3;
          const cy = 500 + node.y * 0.8;
          const pathD = `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;

          return (
            <motion.circle
              key={`particle-conn-${i}`}
              r="2"
              fill="#FFF"
              filter="url(#glow)"
              animate={{
                offsetDistance: ["0%", "100%"]
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2
              }}
              style={{
                offsetPath: `path('${pathD}')`
              }}
            />
          )
        })}
      </svg>
    </div>
  );
}
