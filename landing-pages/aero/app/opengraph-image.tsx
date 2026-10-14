import { ImageResponse } from "next/og";
export const alt = "AÉRO — A little paper. A lot of elsewhere.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f4f1e7",
        color: "#2046ed",
        display: "flex",
        padding: 52,
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: -5 }}>
          AÉRO®
        </span>
        <span style={{ fontSize: 15, letterSpacing: 3 }}>
          BUREAU OF PAPER FLIGHTS / 001
        </span>
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -7,
          lineHeight: 0.95,
        }}
      >
        A little paper.
        <br />A lot of
        <br />
        elsewhere.
        <svg
          width="490"
          height="370"
          viewBox="0 0 490 370"
          style={{ position: "absolute", right: 0, top: -10 }}
        >
          <path d="m30 260 420-230-165 320-76-136Z" fill="#2046ed" />
          <path d="m209 214 241-184-201 240Z" fill="#e84b32" />
          <path d="m209 214 40 56-25 54Z" fill="#142980" />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
        }}
      >
        <span>Fold. Feel. Fly.</span>
        <span>aero-lndev.vercel.app ↗</span>
      </div>
    </div>,
    size,
  );
}
