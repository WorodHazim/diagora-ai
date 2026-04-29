"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, ShieldAlert, FlaskConical, BookOpen, Clock, UserCheck } from "lucide-react";

const FEATURES = [
  {
    title: "Multi-Agent Reasoning",
    desc: "A panel of specialized AI models debating findings to eliminate bias.",
    icon: Users,
  },
  {
    title: "Hidden Risk Detection",
    desc: "Continuous background scanning for edge-case complications and contraindications.",
    icon: ShieldAlert,
  },
  {
    title: "Labs + Imaging",
    desc: "Seamlessly ingest unstructured reports and structured lab results into context.",
    icon: FlaskConical,
  },
  {
    title: "Evidence Grounded",
    desc: "Every claim and differential is linked directly to trusted medical literature.",
    icon: BookOpen,
  },
  {
    title: "Follow-up Timeline",
    desc: "Track patient symptom progression with dynamic risk updates over time.",
    icon: Clock,
  },
  {
    title: "Clinician in Control",
    desc: "The AI acts as an advisory board. The final synthesis and decision is always yours.",
    icon: UserCheck,
  },
];

export function FeatureGridSection() {
  return (
    <section className="bg-[#050711] py-32 relative font-sans border-b border-white/5">
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
            Built for clinical rigor.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
              >
                {/* Subtle hover glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-indigo-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-6 h-6 text-[#7B8CFF]" />
                </div>
                
                <h3 className="text-xl font-medium text-white mb-3">
                  {feat.title}
                </h3>
                <p className="text-white/50 font-light leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
