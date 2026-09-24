"use client";

import {
  motion,
  useReducedMotion,
} from "motion/react";

type MotionProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionReveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: MotionProps & {
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y,
              filter: "blur(5px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.16,
      }}
      transition={{
        duration: 0.72,
        delay,
        ease: [0.22, 
          1, 
          0.36, 
          1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({
  children,
  className = "",
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion 
        ? false 
        : "hidden"}
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.1,
      }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.04,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className = "",
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? {}
          : {
              hidden: {
                opacity: 0,
                y: 24,
                scale: 0.985,
              },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.62,
                  ease: [0.22, 
                    1, 
                    0.36, 
                    1],
                },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function MotionFloat({
  children,
  className = "",
}: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, 
                -8, 
                0],
            }
      }
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
