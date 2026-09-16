// Mirrors the color tokens defined in tailwind.config.js. Use NativeWind
// classNames (e.g. `bg-background`) wherever possible; only reach for these
// raw values where a className isn't accepted (e.g. React Navigation's
// `options`/style objects, which take plain style values, not classNames).
export const theme = {
  background: '#000000',
  surface: '#171717',
  surface100: '#262626',
  surface200: '#404040',
  primary: '#FACC15',
  text: '#FFFFFF',
  textMuted: '#737373',
} as const;
