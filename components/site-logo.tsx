"use client";

import Image from "next/image";
import { useEffect, 
  useState } from "react";

type PublicSettings = {
  logoUrl?: string | null;
  companyName?: string | null;
};

async function loadPublicSettings(): Promise<PublicSettings | null> {
  try {
    const response = await fetch("/api/site-settings", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as PublicSettings;
  } catch {
    return null;
  }
}

type SiteLogoProps = {
  compact?: boolean;
  dark?: boolean;
  size?: "default" | "large";
  centered?: boolean;
};

export function SiteLogo({
  compact = false,
  dark = false,
  size = "default",
  centered = false,
}: SiteLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Rennovex Technology");

  useEffect(() => {
    let cancelled = false;

    void loadPublicSettings().then((data) => {
      if (cancelled 
        || !data) return;
      setLogoUrl(data.logoUrl 
        || null);
      if (data.companyName) setCompanyName(data.companyName);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const large = size === "large";
  const markSize = large 
    ? "h-20 w-20 rounded-2xl" 
    : "h-10 w-10 rounded-xl";
  const imageSizes = large 
    ? "80px" 
    : "40px";

  return (
    <span
      className={`flex min-w-0 items-center gap-3 ${
        large 
          ? "flex-col gap-4 text-center" 
          : ""
      } ${centered 
        ? "justify-center" 
        : ""}`}
    >
      {logoUrl ? (
        <span
          className={`relative shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm ${markSize}`}
        >
          <Image
            src={logoUrl}
            alt={`${companyName} logo`}
            fill
            sizes={imageSizes}
            className="object-contain p-1.5"
            priority={large}
            onError={() => setLogoUrl(null)}
          />
        </span>
      ) : (
        <span
          className={`grid shrink-0 place-items-center bg-blue-700 font-bold text-white shadow-lg shadow-blue-700/20 ${markSize} ${
            large 
              ? "text-3xl" 
              : "text-base"
          }`}
        >
          R
        </span>
      )}

      {!compact && (
        <span
          className={`truncate font-bold ${
            large 
              ? "max-w-[320px] text-xl sm:text-2xl" 
              : "text-sm sm:text-base"
          } ${dark 
            ? "text-white" 
            : "text-slate-950"}`}
        >
          {companyName}
        </span>
      )}
    </span>
  );
}
