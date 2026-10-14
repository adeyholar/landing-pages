/** A real, layered dart fold. Coordinates are measured from the nose. */
export type PaperPoint = [number, number];
export type PaperPanel = {
  points: PaperPoint[];
  first: boolean;
  second: boolean;
  wing: boolean;
};
export const PAPER_WIDTH = 1.7;
export const PAPER_LENGTH = 5.4;
export const FIRST_CREASE: PaperPoint = [PAPER_WIDTH, PAPER_WIDTH];
export const SECOND_CREASE: PaperPoint = [
  PAPER_WIDTH,
  PAPER_WIDTH * (1 + Math.SQRT2),
];
export const WING_CREASE: PaperPoint = [0.57, PAPER_LENGTH];

export function reflect(point: PaperPoint, crease: PaperPoint): PaperPoint {
  const dot =
    (point[0] * crease[0] + point[1] * crease[1]) /
    (crease[0] ** 2 + crease[1] ** 2);
  return [2 * dot * crease[0] - point[0], 2 * dot * crease[1] - point[1]];
}
export function foldedPoint(
  point: PaperPoint,
  panel: Pick<PaperPanel, "first" | "second">,
): PaperPoint {
  let next = point;
  if (panel.first) next = reflect(next, FIRST_CREASE);
  if (panel.second) next = reflect(next, SECOND_CREASE);
  return next;
}
function split(
  panel: PaperPanel,
  crease: PaperPoint,
  step: "first" | "second" | "wing",
): PaperPanel[] {
  const distance = (point: PaperPoint) => {
    const mapped =
      step === "first"
        ? point
        : foldedPoint(point, {
            first: panel.first,
            second: step === "wing" && panel.second,
          });
    return crease[0] * mapped[1] - crease[1] * mapped[0];
  };
  const result: PaperPanel[] = [];
  for (const side of [1, -1]) {
    const points: PaperPoint[] = [];
    for (let i = 0; i < panel.points.length; i++) {
      const a = panel.points[i],
        b = panel.points[(i + 1) % panel.points.length];
      const da = distance(a) * side,
        db = distance(b) * side;
      if (da >= -1e-9) points.push(a);
      if ((da > 1e-9 && db < -1e-9) || (da < -1e-9 && db > 1e-9)) {
        const t = da / (da - db);
        points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    const unique = points.filter((p, i) => {
      const previous = points[(i + points.length - 1) % points.length];
      return Math.hypot(p[0] - previous[0], p[1] - previous[1]) > 1e-8;
    });
    const area =
      unique.reduce((sum, p, i) => {
        const next = unique[(i + 1) % unique.length];
        return sum + p[0] * next[1] - next[0] * p[1];
      }, 0) / 2;
    if (unique.length >= 3 && Math.abs(area) > 1e-8)
      result.push({ ...panel, points: unique, [step]: side === -1 });
  }
  return result;
}
export function createPaperPanels(): PaperPanel[] {
  let panels: PaperPanel[] = [
    {
      points: [
        [0, 0],
        [PAPER_WIDTH, 0],
        [PAPER_WIDTH, PAPER_LENGTH],
        [0, PAPER_LENGTH],
      ],
      first: false,
      second: false,
      wing: false,
    },
  ];
  // Split in the original sheet, using the inverse-image of each completed
  // crease. This also splits folded layers; an entire corner never floats away.
  for (const [crease, step] of [
    [FIRST_CREASE, "first"],
    [SECOND_CREASE, "second"],
    [WING_CREASE, "wing"],
  ] as const)
    panels = panels.flatMap((panel) => split(panel, crease, step));
  return panels;
}
