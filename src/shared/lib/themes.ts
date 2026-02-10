export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    crust: string;
    base: string;
    mantle: string;
    surface0: string;
    surface1: string;
    surface2: string;
    overlay0: string;
    overlay1: string;
    overlay2: string;
    subtext0: string;
    subtext1: string;
    text: string;
    lavender: string;
    blue: string;
    sapphire: string;
    sky: string;
    teal: string;
    green: string;
    yellow: string;
    peach: string;
    maroon: string;
    red: string;
    mauve: string;
    pink: string;
    flamingo: string;
    rosewater: string;
  };
}

// Catppuccin Mocha - Original dark theme
export const catppuccinMocha: Theme = {
  id: "catppuccin-mocha",
  name: "Mocha",
  description: "Classic dark theme with warm tones",
  colors: {
    crust: "#11111b",
    base: "#1e1e2e",
    mantle: "#181825",
    surface0: "#313244",
    surface1: "#45475a",
    surface2: "#585b70",
    overlay0: "#6c7086",
    overlay1: "#7f849c",
    overlay2: "#9399b2",
    subtext0: "#a6adc8",
    subtext1: "#bac2de",
    text: "#cdd6f4",
    lavender: "#b4befe",
    blue: "#89b4fa",
    sapphire: "#74c7ec",
    sky: "#89dceb",
    teal: "#94e2d5",
    green: "#a6e3a1",
    yellow: "#f9e2af",
    peach: "#fab387",
    maroon: "#eba0ac",
    red: "#f38ba8",
    mauve: "#cba6f7",
    pink: "#f5c2e7",
    flamingo: "#f2cdcd",
    rosewater: "#f5e0dc",
  },
};

// Catppuccin Macchiato - Lighter dark theme
export const catppuccinMacchiato: Theme = {
  id: "catppuccin-macchiato",
  name: "Macchiato",
  description: "Softer dark theme with balanced contrast",
  colors: {
    crust: "#181926",
    base: "#24273a",
    mantle: "#1e2030",
    surface0: "#363a4f",
    surface1: "#494d64",
    surface2: "#5b6078",
    overlay0: "#6e738d",
    overlay1: "#8087a2",
    overlay2: "#939ab7",
    subtext0: "#a5adcb",
    subtext1: "#b8c0e0",
    text: "#cad3f5",
    lavender: "#b7bdf8",
    blue: "#8aadf4",
    sapphire: "#7dc4e4",
    sky: "#91d7e3",
    teal: "#8bd5ca",
    green: "#a6da95",
    yellow: "#eed49f",
    peach: "#f5a97f",
    maroon: "#ee99a0",
    red: "#ed8796",
    mauve: "#c6a0f6",
    pink: "#f5bde6",
    flamingo: "#f0c6c6",
    rosewater: "#f4dbd6",
  },
};

// Midnight - Ultra dark matte theme
export const midnightTheme: Theme = {
  id: "midnight",
  name: "Midnight",
  description: "Ultra-dark matte theme for late night sessions",
  colors: {
    // Deeper, more muted backgrounds
    crust: "#0a0a0f",        // Almost black
    base: "#0d0d12",         // Very dark
    mantle: "#08080c",       // Deepest
    // Surfaces with lower saturation
    surface0: "#1a1a22",     // Dark gray with slight blue tint
    surface1: "#25252e",     // Elevated surface
    surface2: "#30303a",     // Highest surface
    // Overlays more muted
    overlay0: "#40404a",
    overlay1: "#50505a",
    overlay2: "#60606a",
    // Text more subdued
    subtext0: "#6b6b75",
    subtext1: "#8a8a94",
    text: "#b8b8c2",         // Muted white
    // Accent colors - more saturated but darker
    lavender: "#7b7bd4",     // Deep lavender
    blue: "#5a8add",         // Deep blue
    sapphire: "#4a9ac9",
    sky: "#5ab8c9",
    teal: "#5ac9b8",
    green: "#6bc96b",        // Muted green
    yellow: "#c9b86b",
    peach: "#c9966b",
    maroon: "#c96b7b",
    red: "#c95a6b",          // Deep red
    mauve: "#9b6bc9",        // Deep purple
    pink: "#c96ba5",
    flamingo: "#c9a5a5",
    rosewater: "#c9b8b8",
  },
};

// High Contrast - For accessibility
export const highContrastTheme: Theme = {
  id: "high-contrast",
  name: "High Contrast",
  description: "Maximum contrast for accessibility",
  colors: {
    crust: "#000000",
    base: "#0a0a0a",
    mantle: "#050505",
    surface0: "#1a1a1a",
    surface1: "#2a2a2a",
    surface2: "#3a3a3a",
    overlay0: "#555555",
    overlay1: "#777777",
    overlay2: "#999999",
    subtext0: "#bbbbbb",
    subtext1: "#dddddd",
    text: "#ffffff",
    lavender: "#aaaaff",
    blue: "#66b3ff",
    sapphire: "#5ac8fa",
    sky: "#7de3f4",
    teal: "#5ac8b9",
    green: "#7ee787",
    yellow: "#f2cc60",
    peach: "#ffab70",
    maroon: "#ff7b72",
    red: "#ff6b6b",
    mauve: "#d2a8ff",
    pink: "#ff9ecf",
    flamingo: "#ffcecf",
    rosewater: "#ffebe9",
  },
};

export const themes: Theme[] = [
  catppuccinMocha,
  catppuccinMacchiato,
  midnightTheme,
  highContrastTheme,
];

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) || catppuccinMocha;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--ctp-${key}`, value);
  });
}
