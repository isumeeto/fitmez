"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { dur, ease } from "@/lib/motion";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: dur.base,
        ease: ease.out,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
