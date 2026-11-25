"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { spring } from "@/lib/motion";

interface PressableProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const Pressable: React.FC<PressableProps> = ({
  children,
  className = "",
  whileTap = { scale: 0.97 },
  transition = spring.snappy,
  ...props
}) => {
  return (
    <motion.button
      whileTap={whileTap}
      transition={transition}
      className={`select-none focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
