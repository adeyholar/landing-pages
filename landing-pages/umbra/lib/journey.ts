export const clamp = (v: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, v));
export const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
export function journeyAt(progress: number) {
  const p = clamp(progress, 0, 3);
  return {
    p,
    unfold: smooth(p),
    passage: smooth(p - 1),
    alignment: smooth(p - 2),
  };
}
export const presets = [
  { name: "First contact", value: 18, caption: "The edge of a beginning." },
  { name: "Totality", value: 50, caption: "Everything, briefly, in place." },
  { name: "Afterglow", value: 82, caption: "What the light leaves behind." },
];
export function alignmentName(value: number) {
  return Math.abs(value - 50) < 4
    ? "Totality"
    : value < 50
      ? "First contact"
      : "Afterglow";
}
export function constellation(value: number) {
  return Array.from({ length: 9 }, (_, i) => {
    const angle = i * 0.62 + (value / 100) * 1.1;
    const radius = 140 + Math.sin(i * 2.4) * 85;
    return {
      x: 450 + Math.cos(angle) * radius,
      y: 490 + Math.sin(angle) * radius,
      r: i % 3 === 0 ? 4 : 2,
    };
  });
}
