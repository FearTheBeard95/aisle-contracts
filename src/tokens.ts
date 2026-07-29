export const COLORS = {
  bg: "#f3f2f2",
  surface: "#eae9e9",
  text: "#201e1d",
  accent: "#ec3013",
  accent100: "#fff2ef",
  accent700: "#ae1800",
  accent800: "#7c1405",
  divider: "#d8d5d4",
  neutral300: "#d7d3d3",
  neutral400: "#bab6b6",
  neutral500: "#9b9797",
  neutral600: "#7d7979",
  neutral700: "#605d5d",
  neutral800: "#444141",
  white: "#ffffff",
  scrim: "rgba(32,30,29,.42)",
} as const;

export const FONTS = {
  heading: "Archivo",
  body: "Archivo",
  mono: "ui-monospace, Menlo, monospace",
} as const;

/** Role → [fontSize, lineHeight multiplier, weight, letterSpacing em]. */
export const TYPE = {
  screenTitle: { size: 30, line: 1.05, weight: 800, tracking: -0.01 },
  screenTitleSm: { size: 26, line: 1.05, weight: 800, tracking: -0.01 },
  pageTitle: { size: 30, line: 1.05, weight: 800, tracking: -0.01 },
  cardTitle: { size: 15, line: 1.15, weight: 800, tracking: 0 },
  body: { size: 13.5, line: 1.55, weight: 400, tracking: 0 },
  meta: { size: 12, line: 1.4, weight: 400, tracking: 0 },
  microLabel: { size: 10.5, line: 1.2, weight: 800, tracking: 0.09 },
  kicker: { size: 10, line: 1.2, weight: 800, tracking: 0.1 },
  price: { size: 17, line: 1.1, weight: 800, tracking: 0 },
  priceLarge: { size: 30, line: 1.05, weight: 800, tracking: -0.01 },
} as const;

export const RADIUS = { md: 0 } as const;
export const RULE = { hairline: 1, strong: 2 } as const;
export const TOUCH_TARGET_MIN = 44;

export type Tokens = {
  colors: typeof COLORS;
  fonts: typeof FONTS;
  type: typeof TYPE;
};
