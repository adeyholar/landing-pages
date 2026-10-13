import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "FALLOW — original landing-page concept by LN";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#dfcad0",
        color: "#4b3242",
        padding: 70,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 35, letterSpacing: -2 }}>fallow®</span>
      <div
        style={{
          display: "flex",
          fontFamily: "serif",
          fontSize: 110,
          letterSpacing: -6,
          lineHeight: 0.96,
          maxWidth: 950,
        }}
      >
        Small things. Other worlds.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
        }}
      >
        <span>An imaginary botanical world</span>
        <span>Developed by LN · Open source</span>
      </div>
    </div>,
    size,
  );
}
