import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="lost">
      <span className="brand">
        AÉRO<span>®</span>
      </span>
      <p className="micro">FLIGHT 404 / UNCHARTED AIRSPACE</p>
      <h1>
        A little
        <br />
        off course.
      </h1>
      <p>Even the best paper planes take the scenic route.</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Back to the departure gate ↗
      </Button>
    </main>
  );
}
