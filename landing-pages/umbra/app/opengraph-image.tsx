import { ImageResponse } from "next/og";

export const alt =
  "UMBRA — At the edge of light. A fictional, interactive observatory.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 64px",
        background: "#080d16",
        color: "#e9e2d6",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 16,
          letterSpacing: "3px",
        }}
      >
        <span>AN IMAGINARY OBSERVATORY</span>
        <span style={{ color: "#e3b994" }}>EST. BEYOND TIME</span>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: 70,
          top: 120,
          width: 390,
          height: 390,
          borderRadius: "50%",
          border: "2px solid #e3b994",
          boxShadow: "0 0 45px #b8793c55, inset 0 0 32px #b8793c33",
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: 42,
          top: 103,
          width: 378,
          height: 378,
          borderRadius: "50%",
          background: "#080d16",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", marginTop: 80 }}>
        <span
          style={{
            fontSize: 164,
            fontWeight: 700,
            letterSpacing: "-12px",
            lineHeight: 1,
          }}
        >
          UMBRA
        </span>
        <span style={{ fontSize: 38, letterSpacing: "-1px", marginTop: 22 }}>
          At the edge of light.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#a5a9b2",
          fontSize: 15,
        }}
      >
        <span>An interactive eclipse. An original world.</span>
        <span>AN EXPERIENCE BY LN</span>
      </div>
    </div>,
    size,
  );
}
