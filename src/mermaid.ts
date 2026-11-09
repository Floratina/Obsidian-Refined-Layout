export function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export interface MermaidDimensions {
  width: number;
  height: number;
}

export function parsePositiveDimensionAttribute(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = Number(trimmed);
  return isPositiveFiniteNumber(parsed) ? parsed : null;
}

export function readMermaidNaturalDimensions(svg: {
  classList: { contains(token: string): boolean };
  getAttribute(name: string): string | null;
  viewBox?: { baseVal?: { width: number; height: number } | null } | null;
}): MermaidDimensions | null {
  if (svg.classList.contains("pele")) {
    const width = parsePositiveDimensionAttribute(svg.getAttribute("width"));
    const height = parsePositiveDimensionAttribute(svg.getAttribute("height"));
    return width !== null && height !== null ? { width, height } : null;
  }
  const baseVal = svg.viewBox?.baseVal;
  if (
    baseVal !== null
    && baseVal !== undefined
    && isPositiveFiniteNumber(baseVal.width)
    && isPositiveFiniteNumber(baseVal.height)
  ) {
    return { width: baseVal.width, height: baseVal.height };
  }
  return null;
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
