"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { FitScore } from "@/lib/types";

interface ScoreGaugeProps {
  score: FitScore;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, className = "" }) => {
  const [displayTotal, setDisplayTotal] = useState(0);

  // 600ms ease-out count-up
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = start + easedProgress * score.total;
      setDisplayTotal(Number(currentVal.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setDisplayTotal(score.total);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [score.total]);

  const subScores = [
    { label: "Proportions & Fit", value: score.fit },
    { label: "Color Harmony", value: score.color },
    { label: "Silhouette & Drape", value: score.accessories || score.fit },
    { label: "Occasion Alignment", value: score.occasion },
  ];

  return (
    <div className={`w-full flex flex-col gap-5 ${className}`}>
      {/* Central Drip Score Card */}
      <div className="w-full p-5 rounded-[28px] bg-[var(--surface-2)] border border-[var(--accent-line)] shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Drip Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-4xl text-[var(--text)] tracking-tight">
              {displayTotal.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-[var(--text-subtle)]">
              / 10
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">
            Excellent tonal pairing & silhouette balance
          </p>
        </div>

        {/* Circular Ring Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="var(--border)"
              strokeWidth="7"
              fill="none"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="32"
              stroke="var(--accent)"
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * 32}
              initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 32 * (1 - score.total / 10),
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute font-display font-bold text-xs text-[var(--accent)]">
            {Math.round((score.total / 10) * 100)}%
          </span>
        </div>
      </div>

      {/* Sub-score Bars */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
          Performance Breakdown
        </h4>
        <div className="flex flex-col gap-2.5">
          {subScores.map((sub, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">
                  {sub.label}
                </span>
                <span className="font-bold text-[var(--text)]">
                  {sub.value.toFixed(1)} / 10
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(sub.value / 10) * 100}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                  className="h-full bg-[var(--accent)] rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
          Stylist Recommendations
        </h4>
        <div className="flex flex-col gap-2">
          {score.tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
