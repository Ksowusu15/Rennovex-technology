"use client";
import { useEffect, useRef } from "react";
export function WorkspaceDisclosure({
  id,
  children,
  defaultOpen = false,
}: {
  id?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!id) return;
    const openFromHash = () => {
      if (window.location.hash === `#${id}` && details.current)
        details.current.open = true;
    };
    const openFromClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (anchor?.getAttribute("href") === `#${id}` && details.current)
        details.current.open = true;
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", openFromClick);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", openFromClick);
    };
  }, [id]);
  return (
    <details
      ref={details}
      id={id}
      open={defaultOpen || undefined}
      className="workspace-details scroll-mt-28"
    >
      {children}
    </details>
  );
}
