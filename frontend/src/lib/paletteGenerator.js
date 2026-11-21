import { contrastRatio } from './colorUtils';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const validHex = (hex) => typeof hex === 'string' && /^#[0-9a-f]{6}$/i.test(hex);

export function hexToHsl(hex) {
  if (!validHex(hex)) return [220, 0.18, 0.42];
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === rgb[0]) hue = ((rgb[1] - rgb[2]) / delta) % 6;
    else if (max === rgb[1]) hue = (rgb[2] - rgb[0]) / delta + 2;
    else hue = (rgb[0] - rgb[1]) / delta + 4;
  }
  hue = (hue * 60 + 360) % 360;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return [hue, saturation, lightness];
}

export function hslToHex(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation, 0, 1);
  const l = clamp(lightness, 0, 1);
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const match = l - chroma / 2;
  const rgb = h < 60 ? [chroma, x, 0] : h < 120 ? [x, chroma, 0] : h < 180 ? [0, chroma, x] : h < 240 ? [0, x, chroma] : h < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return `#${rgb.map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function describeColorCharacter(hex) {
  const [hue, saturation, lightness] = hexToHsl(hex);
  if (saturation < 0.14) return 'soft and neutral';
  if (lightness >= 0.68 && saturation >= 0.18) return 'pastel';
  if (lightness <= 0.24) return 'deep';
  if (hue >= 32 && hue <= 60 && saturation >= 0.45 && lightness >= 0.32 && lightness <= 0.72) return 'earthy';
  if (saturation >= 0.68) return 'vibrant';
  if (((hue >= 18 && hue <= 75) || (hue >= 75 && hue <= 165)) && saturation <= 0.56 && lightness >= 0.25 && lightness <= 0.68) return 'earthy';
  if (saturation <= 0.43) return 'muted';
  return 'soft';
}

function ensureContrast(hex, background, minimum = 4.5) {
  if (contrastRatio(hex, background) >= minimum) return hex;
  const [hue, saturation, lightness] = hexToHsl(hex);
  const candidates = [];
  for (let step = 0; step <= 100; step += 1) {
    const candidateLightness = step / 100;
    const candidate = hslToHex(hue, saturation, candidateLightness);
    if (contrastRatio(candidate, background) >= minimum) candidates.push(candidate);
  }
  return candidates.sort((a, b) => Math.abs(hexToHsl(a)[2] - lightness) - Math.abs(hexToHsl(b)[2] - lightness))[0] || hex;
}

/** Build a cohesive four-role palette while preserving the user's chosen HEX exactly. */
export function generatePaletteFromReference(referenceHex, referenceRole = 'primary', variation = 0) {
  if (!validHex(referenceHex)) throw new Error('Choose a valid HEX color first.');
  const role = ['primary', 'secondary', 'accent', 'surface'].includes(referenceRole) ? referenceRole : 'primary';
  const [referenceHue, referenceSaturation, referenceLightness] = hexToHsl(referenceHex);
  const character = describeColorCharacter(referenceHex);
  const hue = referenceSaturation < 0.14 ? 222 : referenceHue;
  const shift = variation * 11;

  const profiles = {
    pastel: { p: [0, 0.44, 0.43], s: [28, 0.38, 0.66], a: [188, 0.43, 0.56], surface: [18, 0.13, 0.97] },
    deep: { p: [0, 0.48, 0.24], s: [24, 0.36, 0.39], a: [178, 0.48, 0.53], surface: [22, 0.1, 0.96] },
    vibrant: { p: [0, 0.62, 0.38], s: [24, 0.58, 0.52], a: [180, 0.64, 0.57], surface: [18, 0.09, 0.97] },
    earthy: { p: [0, 0.34, 0.32], s: [26, 0.3, 0.48], a: [168, 0.38, 0.52], surface: [34, 0.16, 0.94] },
    muted: { p: [0, 0.36, 0.34], s: [26, 0.28, 0.51], a: [176, 0.4, 0.53], surface: [24, 0.11, 0.96] },
    soft: { p: [0, 0.44, 0.35], s: [25, 0.34, 0.52], a: [182, 0.44, 0.55], surface: [18, 0.1, 0.97] },
    'soft and neutral': { p: [0, 0.32, 0.32], s: [26, 0.24, 0.5], a: [180, 0.35, 0.53], surface: [20, 0.09, 0.96] }
  }[character];

  const make = ([hueOffset, saturation, lightness], roleName) => {
    const roleHue = hue + hueOffset + (roleName === 'secondary' || roleName === 'accent' ? shift : 0);
    const moodSaturation = character === 'pastel' ? Math.min(saturation, Math.max(0.18, referenceSaturation * 0.72)) : saturation;
    const moodLightness = character === 'pastel' && roleName === 'surface' ? Math.max(lightness, referenceLightness, 0.94) : lightness;
    return hslToHex(roleHue, moodSaturation, moodLightness);
  };

  const colors = {
    primary: make(profiles.p, 'primary'),
    secondary: make(profiles.s, 'secondary'),
    accent: make(profiles.a, 'accent'),
    surface: make(profiles.surface, 'surface')
  };
  colors[role] = referenceHex;

  // Keep generated ink colors readable on the generated surface. A user-picked
  // value is never altered, even when that choice needs contrasting text instead.
  for (const inkRole of ['primary', 'secondary', 'accent']) {
    if (inkRole !== role) colors[inkRole] = ensureContrast(colors[inkRole], colors.surface, inkRole === 'accent' ? 3 : 4.5);
  }
  return { colors, character };
}
