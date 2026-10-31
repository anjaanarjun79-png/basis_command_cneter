export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentPresetId =
  | 'indigo'
  | 'blue'
  | 'emerald'
  | 'teal'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'custom';

export interface AccentScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface AccentPreset {
  id: AccentPresetId;
  name: string;
  primaryColor: string; // Hex used for swatch preview and base
  scale: AccentScale;
}

// Tailored, high-quality Tailwind OKLCH/hex color scales for the 7 presets
export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    primaryColor: '#4f46e5',
    scale: {
      50: 'oklch(96.2% 0.018 272.314)',
      100: 'oklch(93% 0.034 272.788)',
      200: 'oklch(87% 0.065 274.039)',
      300: 'oklch(78.5% 0.115 274.713)',
      400: 'oklch(67.3% 0.182 276.935)',
      500: 'oklch(58.5% 0.233 277.117)',
      600: 'oklch(51.1% 0.262 276.966)',
      700: 'oklch(45.7% 0.24 277.023)',
      800: 'oklch(39.8% 0.195 277.366)',
      900: 'oklch(35.9% 0.144 278.697)',
      950: 'oklch(25.7% 0.09 281.288)',
    },
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    primaryColor: '#2563eb',
    scale: {
      50: 'oklch(97% 0.014 254.604)',
      100: 'oklch(93.2% 0.032 255.585)',
      200: 'oklch(88.2% 0.059 254.128)',
      300: 'oklch(80.9% 0.105 251.813)',
      400: 'oklch(70.7% 0.165 254.624)',
      500: 'oklch(62.3% 0.214 259.815)',
      600: 'oklch(54.6% 0.245 262.881)',
      700: 'oklch(48.8% 0.243 264.376)',
      800: 'oklch(42.4% 0.199 265.638)',
      900: 'oklch(37.9% 0.146 265.522)',
      950: 'oklch(28.2% 0.091 267.935)',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primaryColor: '#059669',
    scale: {
      50: 'oklch(97.9% 0.021 166.113)',
      100: 'oklch(95% 0.052 163.051)',
      200: 'oklch(90.5% 0.093 164.15)',
      300: 'oklch(84.5% 0.143 164.978)',
      400: 'oklch(76.5% 0.177 163.223)',
      500: 'oklch(69.6% 0.17 162.48)',
      600: 'oklch(59.6% 0.145 163.225)',
      700: 'oklch(50.8% 0.118 165.612)',
      800: 'oklch(43.2% 0.095 166.913)',
      900: 'oklch(37.8% 0.077 168.94)',
      950: 'oklch(26.2% 0.051 172.552)',
    },
  },
  {
    id: 'teal',
    name: 'Teal',
    primaryColor: '#0d9488',
    scale: {
      50: 'oklch(98.4% 0.014 180.72)',
      100: 'oklch(95.3% 0.051 180.801)',
      200: 'oklch(91% 0.096 180.426)',
      300: 'oklch(85.5% 0.138 181.071)',
      400: 'oklch(77.7% 0.152 181.912)',
      500: 'oklch(70.4% 0.14 182.503)',
      600: 'oklch(60% 0.118 184.704)',
      700: 'oklch(51.1% 0.096 186.391)',
      800: 'oklch(43.7% 0.078 188.216)',
      900: 'oklch(38.6% 0.063 188.416)',
      950: 'oklch(27.7% 0.046 192.524)',
    },
  },
  {
    id: 'violet',
    name: 'Violet',
    primaryColor: '#7c3aed',
    scale: {
      50: 'oklch(96.9% 0.016 293.756)',
      100: 'oklch(94.3% 0.029 294.588)',
      200: 'oklch(89.4% 0.057 293.283)',
      300: 'oklch(81.1% 0.111 293.571)',
      400: 'oklch(70.2% 0.183 293.541)',
      500: 'oklch(60.6% 0.25 292.717)',
      600: 'oklch(54.1% 0.281 293.009)',
      700: 'oklch(49.1% 0.27 292.581)',
      800: 'oklch(43.2% 0.232 292.759)',
      900: 'oklch(38% 0.189 293.745)',
      950: 'oklch(28.3% 0.141 291.089)',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    primaryColor: '#e11d48',
    scale: {
      50: 'oklch(96.9% 0.015 12.422)',
      100: 'oklch(94.1% 0.03 12.58)',
      200: 'oklch(89.2% 0.058 10.001)',
      300: 'oklch(81% 0.117 11.638)',
      400: 'oklch(71.2% 0.194 13.428)',
      500: 'oklch(64.5% 0.246 16.439)',
      600: 'oklch(58.6% 0.253 17.585)',
      700: 'oklch(51.4% 0.222 16.935)',
      800: 'oklch(45.5% 0.188 13.697)',
      900: 'oklch(41% 0.159 10.272)',
      950: 'oklch(27.1% 0.105 12.094)',
    },
  },
  {
    id: 'amber',
    name: 'Amber',
    primaryColor: '#d97706',
    scale: {
      50: 'oklch(98.7% 0.022 95.277)',
      100: 'oklch(96.2% 0.059 95.617)',
      200: 'oklch(92.4% 0.12 95.746)',
      300: 'oklch(87.9% 0.169 91.605)',
      400: 'oklch(82.8% 0.189 84.429)',
      500: 'oklch(76.9% 0.188 70.08)',
      600: 'oklch(66.6% 0.179 58.318)',
      700: 'oklch(55.5% 0.163 48.998)',
      800: 'oklch(47.3% 0.137 46.201)',
      900: 'oklch(41.4% 0.112 45.904)',
      950: 'oklch(27.9% 0.077 45.635)',
    },
  },
];

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

// Helper to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Generate a complete 11-step scale from any valid hex color
export function generateCustomScale(hex: string): AccentScale {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    // Fallback to indigo if invalid
    return ACCENT_PRESETS[0].scale;
  }
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Generates accessible HSL values across the 50-950 luminance spectrum
  return {
    50: `hsl(${h}, ${Math.max(20, Math.min(100, s))}%, 96%)`,
    100: `hsl(${h}, ${Math.max(25, Math.min(100, s))}%, 92%)`,
    200: `hsl(${h}, ${Math.max(30, Math.min(100, s))}%, 84%)`,
    300: `hsl(${h}, ${Math.max(35, Math.min(100, s))}%, 74%)`,
    400: `hsl(${h}, ${Math.max(40, Math.min(100, s))}%, 62%)`,
    500: `hsl(${h}, ${Math.max(45, Math.min(100, s))}%, 52%)`,
    600: `hsl(${h}, ${Math.max(50, Math.min(100, s))}%, 44%)`,
    700: `hsl(${h}, ${Math.max(55, Math.min(100, s))}%, 36%)`,
    800: `hsl(${h}, ${Math.max(50, Math.min(100, s))}%, 28%)`,
    900: `hsl(${h}, ${Math.max(45, Math.min(100, s))}%, 20%)`,
    950: `hsl(${h}, ${Math.max(40, Math.min(100, s))}%, 12%)`,
  };
}

// Apply CSS variables dynamically to the document root
export function applyThemeVariables(
  themeMode: ThemeMode,
  accentId: AccentPresetId,
  customColor?: string
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Resolve light vs dark active state
  let isDark = false;
  if (themeMode === 'system') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = themeMode === 'dark';
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Resolve accent scale
  let scale: AccentScale;
  if (accentId === 'custom' && customColor) {
    scale = generateCustomScale(customColor);
  } else {
    const preset = ACCENT_PRESETS.find((p) => p.id === accentId) || ACCENT_PRESETS[0];
    scale = preset.scale;
  }

  // 3. Inject Tailwind-mapped variables into root inline styles
  root.style.setProperty('--color-indigo-50', scale[50]);
  root.style.setProperty('--color-indigo-100', scale[100]);
  root.style.setProperty('--color-indigo-200', scale[200]);
  root.style.setProperty('--color-indigo-300', scale[300]);
  root.style.setProperty('--color-indigo-400', scale[400]);
  root.style.setProperty('--color-indigo-500', scale[500]);
  root.style.setProperty('--color-indigo-600', scale[600]);
  root.style.setProperty('--color-indigo-700', scale[700]);
  root.style.setProperty('--color-indigo-800', scale[800]);
  root.style.setProperty('--color-indigo-900', scale[900]);
  root.style.setProperty('--color-indigo-950', scale[950]);

  // Also update semantic --accent custom properties
  root.style.setProperty('--accent', isDark ? scale[500] : scale[600]);
  root.style.setProperty('--accent-hover', isDark ? scale[400] : scale[700]);
  root.style.setProperty('--accent-subtle', isDark ? scale[950] : scale[50]);
  root.style.setProperty('--accent-border', isDark ? scale[800] : scale[200]);
}

export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}
