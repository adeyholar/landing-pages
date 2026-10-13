import { ImageResponse } from "next/og";
export const alt = "CRUX — Find your next move";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#d9ef48",
        color: "#252820",
        width: "100%",
        height: "100%",
        padding: 65,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 4 }}>
        CRUX / INDEPENDENT CLIMBING CLUB
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -6,
          maxWidth: 1000,
        }}
      >
        LESS SCROLL. MORE SEND.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        <span>FIND YOUR NEXT MOVE.</span>
        <span>LN · DESIGN CONCEPT</span>
      </div>
    </div>,
    size,
  );
}
