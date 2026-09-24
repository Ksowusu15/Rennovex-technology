import { ImageResponse } from "next/og";

export const size = { width: 64, 
  height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", 
      height: "100%", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      borderRadius: 16, 
      background: "linear-gradient(135deg,#1d4ed8,#4f46e5)", 
      color: "white", 
      fontSize: 36, 
      fontWeight: 800 }}>R</div>,
    size,
  );
}
