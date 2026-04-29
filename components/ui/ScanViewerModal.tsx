"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react";

interface ScanViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
  hasHighlight?: boolean;
  highlightLabel?: string;
}

export function ScanViewerModal({
  isOpen,
  onClose,
  imageSrc,
  title,
  hasHighlight = false,
  highlightLabel = "Suspicious region detected"
}: ScanViewerModalProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const handleReset = () => setScale(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title */}
          <div className="absolute top-6 left-6 z-50 pointer-events-none">
            <h2 className="text-xl font-bold tracking-widest text-white uppercase drop-shadow-md">
              {title}
            </h2>
            {hasHighlight && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="mt-3 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(217,70,239,0.15)] pointer-events-auto"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_#d946ef]" />
                <span className="text-sm font-bold text-fuchsia-200 tracking-wider uppercase">{highlightLabel}</span>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-2xl bg-[#0A0D20]/80 border border-white/10 backdrop-blur-xl z-50 shadow-2xl">
            <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white transition-colors"><ZoomOut className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-white/10" />
            <span className="text-sm font-medium text-white/50 w-12 text-center">{Math.round(scale * 100)}%</span>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white transition-colors"><ZoomIn className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={handleReset} className="p-2 text-white/70 hover:text-white transition-colors"><Maximize className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2 text-white/40 text-xs px-2">
              <MousePointer2 className="w-4 h-4" /> Drag to pan
            </div>
          </div>

          {/* Viewport */}
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
            <motion.div
              drag
              dragConstraints={{ left: -1500, right: 1500, top: -1500, bottom: 1500 }}
              dragElastic={0.1}
              animate={{ scale }}
              transition={{ scale: { type: "spring", stiffness: 300, damping: 30 } }}
              className="relative"
            >
              <img
                src={imageSrc}
                alt={title}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                draggable={false}
              />

              {/* AI Highlight Overlay */}
              {hasHighlight && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute top-[50%] left-[60%] w-[18%] h-[18%] -translate-x-1/2 -translate-y-1/2 border-2 border-fuchsia-500/50 rounded-[3rem]"
                >
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.5)_0%,_rgba(249,115,22,0.2)_50%,_transparent_100%)] rounded-[3rem] blur-md shadow-[0_0_50px_rgba(217,70,239,0.3)]"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 80 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="absolute -top-[1px] -right-[80px] h-[2px] bg-fuchsia-500/80"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="absolute -top-[15px] -right-[230px] bg-black/60 border border-fuchsia-500/30 backdrop-blur-md px-4 py-2 rounded-xl flex flex-col gap-1 shadow-[0_0_30px_rgba(217,70,239,0.2)]"
                  >
                    <span className="text-fuchsia-300 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">AI-highlighted region</span>
                    <span className="text-white/90 text-sm font-medium whitespace-nowrap">{highlightLabel}</span>
                    <span className="text-orange-300 text-[10px] font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" /> Visual confidence: 82%
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
