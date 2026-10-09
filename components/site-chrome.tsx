"use client";

import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollControls } from "@/components/scroll-controls";
import { RennovexAssistant } from "@/components/rennovex-assistant";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isClientPortal = pathname.startsWith("/client-portal");

  if (isAdmin || isClientPortal) return <>{children}</>;

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />
      <motion.div
        id="main-content"
        tabIndex={-1}
        key={pathname}
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
      <Footer />
      <ScrollControls />
      <RennovexAssistant />
    </MotionConfig>
  );
}
