export type LoadState = {
  status: "loading" | "ready" | "fallback";
  progress: number;
  stage: string;
};
export const initialLoad: LoadState = {
  status: "loading",
  progress: 0,
  stage: "Opening the observatory",
};
