"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollControls } from "@/components/scroll-controls";
import { RennovexAssistant } from "@/components/rennovex-assistant";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <motion.main
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
          ease: [0.22, 
            1, 
            0.36, 
            1],
        }}
      >
        {children}
      </motion.main>
      <Footer />
      <ScrollControls />
      <RennovexAssistant />
    </>
  );
}
