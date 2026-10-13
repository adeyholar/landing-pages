export type WorldLoadState = {
  status: "loading" | "ready" | "fallback";
  progress: number;
  stage: string;
};

export const INITIAL_WORLD_LOAD: WorldLoadState = {
  status: "loading",
  progress: 0,
  stage: "Gathering a little world",
};
