export function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function isPortraitMermaid(
  width: number,
  height: number,
  portraitAspectRatio: number,
): boolean {
  if (!isPositiveFiniteNumber(width) || !isPositiveFiniteNumber(height)) {
    throw new RangeError(`Mermaid viewBox dimensions must be positive finite numbers: ${width} x ${height}`);
  }
  if (!isPositiveFiniteNumber(portraitAspectRatio)) {
    throw new RangeError(`Mermaid portrait aspect ratio must be a positive finite number: ${portraitAspectRatio}`);
  }
  return width / height <= portraitAspectRatio;
}
