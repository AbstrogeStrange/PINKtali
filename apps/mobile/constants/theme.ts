// Global theme tokens — use in StyleSheet or inline
export const Colors = {
  brand:       '#1A56DB',
  brandHover:  '#1648C0',
  dark: {
    bg:          '#0F0F0F',
    surface:     '#1A1A1A',
    surfaceHover:'#2A2A2A',
    border:      '#2D2D2D',
    text:        '#F1F1F1',
    textMuted:   '#AAAAAA',
    card:        '#181818',
  },
  light: {
    bg:          '#FFFFFF',
    surface:     '#F2F2F2',
    surfaceHover:'#E8E8E8',
    border:      '#E5E5E5',
    text:        '#0F0F0F',
    textMuted:   '#606060',
    card:        '#FFFFFF',
  },
  gradients: [
    ['#2563EB', '#7C3AED'], // blue → purple
    ['#DB2777', '#EF4444'], // pink → red
    ['#059669', '#0891B2'], // emerald → cyan
    ['#D97706', '#EA580C'], // amber → orange
  ]
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32,
} as const;

export const FontSize = {
  xs: 11, sm: 13, base: 14, md: 15, lg: 17, xl: 20, '2xl': 24,
} as const;

export const Radius = {
  sm: 6, md: 10, lg: 14, xl: 18, full: 9999,
} as const;
