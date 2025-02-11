export function asCSSVars(obj: Record<string, string | number | undefined>) {
  const style: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];

    if (value)
      style[`--${key}`] = typeof value === "number" ? `${value}px` : value;
  }

  return style;
}
