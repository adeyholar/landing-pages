import { ImageResponse } from "next/og";
export const alt = "Marée — Come back to your senses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#e6ead7",
        color: "#24483e",
        width: "100%",
        height: "100%",
        padding: 65,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 4 }}>
        marée / A COASTAL BATH HOUSE
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 105,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: -6,
          maxWidth: 1000,
        }}
      >
        Come back to your senses.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        <span>WARM UP. COOL DOWN. DRIFT A LITTLE.</span>
        <span>LN · DESIGN CONCEPT</span>
      </div>
    </div>,
    size,
  );
}
