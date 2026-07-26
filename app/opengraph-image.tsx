import { ImageResponse } from "next/og";

export const alt = "Rennovex Technology — Digital solutions that drive growth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#eff6ff 0%,#ffffff 48%,#eef2ff 100%)", color: "#0f172a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 800 }}>
        <div style={{ width: 66, height: 66, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: "#1d4ed8", color: "white" }}>R</div>
        Rennovex Technology
      </div>
      <div style={{ maxWidth: 940, fontSize: 70, lineHeight: 1.06, fontWeight: 800, letterSpacing: -2 }}>Digital solutions that drive business growth.</div>
      <div style={{ fontSize: 28, color: "#475569" }}>Websites · Custom software · UI/UX · Branding · IT consulting</div>
    </div>,
    size,
  );
}
