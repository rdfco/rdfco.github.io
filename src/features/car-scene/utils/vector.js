export const interpolateVector = (from, to, progress) =>
  from.map((value, index) => value + (to[index] - value) * progress)
