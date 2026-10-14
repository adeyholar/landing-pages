export type LoadState = {
  status: "loading" | "ready" | "fallback";
  progress: number;
  stage: string;
};
export const LIVERIES = [
  { name: "Air mail", color: "#f4f1e7", ink: "#2046ed", code: "AM" },
  { name: "Blue hour", color: "#2046ed", ink: "#f4f1e7", code: "BH" },
  { name: "Red letter", color: "#e84b32", ink: "#fff3df", code: "RL" },
] as const;
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** One reversible clock. A flat sheet is exposed before its connected creases close. */
export function foldAt(p: number) {
  return 1 - smooth(0.48, 1.04, p) + smooth(1.2, 1.78, p);
}
