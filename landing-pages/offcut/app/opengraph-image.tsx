import { ImageResponse } from "next/og";
export const alt = "offcut — Good wood. New moods.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f8f3e7",
        color: "#4b2d36",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          letterSpacing: 3,
        }}
      >
        <span>AN INDEPENDENT DESIGN CONCEPT</span>
        <span>LN / OPEN SOURCE</span>
      </div>
      <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -10 }}>
        offcut
      </div>
      <div style={{ fontSize: 38 }}>Good wood. New moods.</div>
    </div>,
    size,
  );
}
