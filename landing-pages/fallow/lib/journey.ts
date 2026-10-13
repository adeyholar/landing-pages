/** All story phases share one scroll clock, including when scrolling backwards. */
export function journeyAt(progress: number) {
  const p = Math.max(0, Math.min(3, progress));
  const ease = (start: number, end: number) => {
    const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  return {
    progress: p,
    roots: ease(0.35, 0.9) * (1 - ease(1.2, 1.7)),
    bloom: ease(1.5, 2),
    meadow: ease(2.3, 3),
  };
}
