"use client";

import React from "react";
import { motion } from "motion/react";
import { dur, ease } from "@/lib/motion";

interface StaggerProps {
  children: React.ReactNode;
  staggerMs?: number;
  className?: string;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerMs = 40,
  className = "",
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerMs / 1000,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        if (idx >= 8) return child; // max 8 items staggered

        return (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: dur.base, ease: ease.out },
              },
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
