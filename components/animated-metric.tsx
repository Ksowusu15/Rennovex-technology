"use client";

import { useEffect, 
  useRef, 
  useState } from "react";
import { useInView } from "motion/react";

export function AnimatedMetric({ value, suffix = "", duration = 1100 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, 
    { once: true, 
    amount: 0.7 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 
        1);
      const eased = 1 - Math.pow(1 - progress, 
        3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, 
    inView, 
    value]);

  return <span ref={ref}>
    {display}
    {suffix}
  </span>;
}
