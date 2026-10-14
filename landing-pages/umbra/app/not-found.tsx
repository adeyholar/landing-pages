import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="observatory"
      style={{
        display: "flex",
        minHeight: "100svh",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "clamp(2rem, 8vw, 8rem)",
        background: "#080d16",
        color: "#e9e2d6",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          color: "#e3b994",
          fontSize: 12,
        }}
      >
        UMBRA / SIGNAL 404
      </p>
      <h1
        style={{
          fontSize: "clamp(3rem, 8vw, 7rem)",
          lineHeight: 1,
          letterSpacing: "-.06em",
        }}
      >
        Beyond our orbit.
      </h1>
      <p>This coordinate is outside the observatory.</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Return to UMBRA
      </Button>
    </main>
  );
}
