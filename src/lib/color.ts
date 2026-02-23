function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeHex(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  const v = raw.startsWith("#") ? raw.slice(1) : raw;
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(v)) return null;
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  return `#${full.toUpperCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const v = n.slice(1);
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return { r, g, b };
}

// Returns Tailwind/Shadcn-friendly CSS variable payload: "H S% L%" (without the `hsl()` wrapper)
export function hexToHslVar(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }

    h = h * 60;
    if (h < 0) h += 360;
  }

  const H = Math.round(clamp(h, 0, 360));
  const S = Math.round(clamp(s * 100, 0, 100));
  const L = Math.round(clamp(l * 100, 0, 100));
  return `${H} ${S}% ${L}%`;
}

// Very small heuristic: pick black/white for readable text over a hex background.
export function readableTextOn(hexBg: string): "#000000" | "#FFFFFF" {
  const rgb = hexToRgb(hexBg);
  if (!rgb) return "#000000";
  // WCAG relative luminance
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.5 ? "#000000" : "#FFFFFF";
}
