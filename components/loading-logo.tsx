import Image from "next/image";
import logo from "@/public/rennovex-logo.png";

/** Static imports provide an inline preview before the image downloads. */
export function LoadingLogo() {
  return (
    <Image
      src={logo}
      alt=""
      aria-hidden="true"
      width={96}
      height={64}
      sizes="96px"
      placeholder="blur"
      loading="eager"
      fetchPriority="high"
      className="h-16 w-24 object-contain"
    />
  );
}
