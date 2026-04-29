"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Input Clinical Case",
    desc: "Seamlessly ingest patient history, labs, and imaging data into the secure reasoning core.",
  },
  {
    num: "02",
    title: "Agents Debate",
    desc: "Specialized models analyze the data from their unique clinical perspectives and converge on findings.",
  },
  {
    num: "03",
    title: "Clear Decision",
    desc: "Receive a synthesis of risks, evidence, and actionable pathways with total transparency.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-[#050711] py-32 relative overflow-hidden font-sans border-b border-white/5">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-24"
        >
          <h2 className="text-sm font-semibold tracking-[0.2em] text-indigo-400 uppercase mb-4">
            How It Works
          </h2>
          <h3 className="text-4xl md:text-5xl font-medium tracking-tight text-white max-w-2xl">
            A methodical approach to clinical reasoning.
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
              className="flex flex-col group"
            >
              <div className="text-6xl font-light text-white/20 mb-8 border-b border-white/10 pb-6 group-hover:text-[#7B8CFF] transition-colors duration-500">
                {step.num}
              </div>
              <h4 className="text-2xl font-medium text-white mb-4">{step.title}</h4>
              <p className="text-lg text-white/50 font-light leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
