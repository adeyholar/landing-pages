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

const FLIGHT_KEYS = [
  {
    p: 0,
    position: [0, 0.05, 0],
    cam: [0, 5.9, 11.2],
    look: [0, 0, -0.1],
    rotation: [-0.04, 2.48, -0.12],
    target: [0.43, -0.02],
  },
  {
    p: 1.04,
    position: [0, 0.1, 0],
    cam: [0, 10.5, 8.1],
    look: [0, 0, 0],
    rotation: [0, -0.26, -0.12],
    target: [0.43, 0.24],
  },
  {
    p: 1.8,
    position: [0, 0.45, -1],
    cam: [0, 4.5, 9.2],
    look: [0, 0.3, -1.8],
    rotation: [0, -0.15, -0.06],
    target: [0.4, -0.05],
  },
  {
    p: 2.1,
    position: [0, 0.65, -6],
    cam: [0, 3.8, 3.2],
    look: [0, 0.6, -7],
    rotation: [0.04, -0.04, 0.03],
    target: [0.27, -0.09],
  },
  {
    p: 2.62,
    position: [0.2, 1.2, -23],
    cam: [-0.8, 4.8, -14],
    look: [0.2, 0.7, -24],
    rotation: [0.02, 0.22, -0.2],
    target: [0.22, -0.09],
  },
  {
    p: 3,
    position: [0, 0.15, -34],
    cam: [0, 5.9, -22.5],
    look: [0, 0, -34.5],
    rotation: [-0.03, 2.48, -0.14],
    target: [-0.39, -0.43],
  },
];

type FlightPose = {
  position: [number, number, number];
  cam: [number, number, number];
  look: [number, number, number];
  rotation: [number, number, number];
  target: [number, number];
};
const FIELDS = ["position", "cam", "look", "rotation", "target"] as const;
// Shape-preserving Hermite tangents carry momentum through a waypoint,
// without overshooting its framing or reversing a forward camera movement.
const TANGENTS = FLIGHT_KEYS.map(
  (key, i) =>
    Object.fromEntries(
      FIELDS.map((field) => [
        field,
        key[field].map((_, axis) => {
          if (i === 0 || i === FLIGHT_KEYS.length - 1) return 0;
          const previous = FLIGHT_KEYS[i - 1],
            next = FLIGHT_KEYS[i + 1];
          const left = key.p - previous.p,
            right = next.p - key.p;
          const a = (key[field][axis] - previous[field][axis]) / left;
          const b = (next[field][axis] - key[field][axis]) / right;
          if (a * b <= 0) return 0;
          const w1 = 2 * right + left,
            w2 = right + 2 * left;
          return (w1 + w2) / (w1 / a + w2 / b);
        }),
      ]),
    ) as FlightPose,
);

export function flightPoseAt(progress: number): FlightPose {
  const p = Math.max(0, Math.min(3, progress));
  const i = Math.min(
    FLIGHT_KEYS.length - 2,
    FLIGHT_KEYS.findIndex(
      (key, index) =>
        index === FLIGHT_KEYS.length - 1 || p < FLIGHT_KEYS[index + 1].p,
    ),
  );
  const a = FLIGHT_KEYS[i],
    b = FLIGHT_KEYS[i + 1],
    span = b.p - a.p;
  const t = (p - a.p) / span,
    t2 = t * t,
    t3 = t2 * t;
  return Object.fromEntries(
    FIELDS.map((field) => [
      field,
      a[field].map(
        (value, axis) =>
          (2 * t3 - 3 * t2 + 1) * value +
          (t3 - 2 * t2 + t) * span * TANGENTS[i][field][axis] +
          (-2 * t3 + 3 * t2) * b[field][axis] +
          (t3 - t2) * span * TANGENTS[i + 1][field][axis],
      ),
    ]),
  ) as FlightPose;
}

export const THROW_DURATION = 2.8;
/** A closed glide with zero velocity at departure and return. */
export function throwPoseAt(elapsed: number) {
  const t = clamp(elapsed / THROW_DURATION);
  const lift = Math.sin(t * Math.PI) ** 2;
  const bank = Math.sin(t * Math.PI * 2) * lift;
  return {
    x: bank * 0.65,
    y: lift * 1.15,
    z: -lift * 4.8,
    bank: bank * 0.24,
    pitch: -lift * 0.13,
  };
}
