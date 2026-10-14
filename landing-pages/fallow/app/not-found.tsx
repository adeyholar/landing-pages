import Link from "next/link";
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "20vh 8%",
        background: "#e1cbd0",
        pointerEvents: "auto",
      }}
    >
      <span>FALLOW / 404</span>
      <h1 style={{ fontSize: "clamp(65px,10vw,130px)", margin: "30px 0" }}>
        A little
        <br />
        <em>off the path.</em>
      </h1>
      <p>This part of the garden hasn’t grown yet.</p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: 30,
          textDecoration: "underline",
        }}
      >
        Back to the beginning ↗︎
      </Link>
    </main>
  );
}
