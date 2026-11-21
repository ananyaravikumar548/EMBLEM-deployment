import { calculateContrastRatio } from './consistencyAuditor';
import { CURATED_PALETTES } from '../data/curatedPalettes';
import { describeColorCharacter, generatePaletteFromReference } from './paletteGenerator';

const validHex = (value) => /^#[\da-f]{6}$/i.test(value);

describe('curated color collection', () => {
  it('contains all eight named palettes and preserves every supplied swatch value', () => {
    expect(CURATED_PALETTES.map(({ id }) => id)).toEqual([
      'emerald-earth', 'sapphire-sand', 'blush-botanical', 'warm-burgundy',
      'blue-brown', 'purple-ocean', 'jungle-green', 'imperial-violet'
    ]);
    expect(CURATED_PALETTES.flatMap(({ swatches }) => swatches.map(({ hex }) => hex))).toEqual([
      '#284139', '#809076', '#F8D794', '#BB6830', '#111A19',
      '#3C507D', '#112250', '#E0C58F', '#F5F0E9', '#D9CBC2',
      '#FFF7E6', '#F7C8D3', '#B46A72', '#A8B58A', '#A9B7C6', '#2D3A47',
      '#D7C1A8', '#A28C75', '#6C5141', '#7C2220', '#5F2119',
      '#B5ACA3', '#B0D2EC', '#849DBB', '#648EC0', '#533A33',
      '#CAA9F3', '#B37AD4', '#7997E6', '#206ABC', '#0E155E',
      '#1E201F', '#193A31', '#1D6C61', '#3EB9A8', '#5AA371',
      '#2A123F', '#4B1F6F', '#9C86B9', '#C686DD', '#F1EDF7'
    ]);
  });
});

describe('custom palette generation', () => {
  const examples = [
    ['#C8A2C8', 'pastel'], ['#32105A', 'deep'], ['#7B2CDB', 'vibrant'],
    ['#B46A72', 'muted'], ['#B0D2EC', 'pastel'], ['#14264F', 'deep'],
    ['#9EAA80', 'earthy'], ['#008F5B', 'vibrant'], ['#D4A017', 'earthy']
  ];

  it.each(examples)('recognizes the character of %s', (hex, expected) => {
    expect(describeColorCharacter(hex)).toBe(expected);
  });

  it.each(examples.flatMap(([hex]) => ['primary', 'secondary', 'accent', 'surface'].map((role) => [hex, role])))('keeps %s exactly in the edited %s role and generates four valid tokens', (hex, role) => {
    const { colors } = generatePaletteFromReference(hex, role);
    expect(colors[role]).toBe(hex);
    expect(Object.keys(colors).sort()).toEqual(['accent', 'primary', 'secondary', 'surface']);
    Object.values(colors).forEach((value) => expect(validHex(value)).toBe(true));
    if (role !== 'primary' && role !== 'surface') expect(calculateContrastRatio(colors.primary, colors.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('regenerates a different harmony while preserving the reference color', () => {
    const first = generatePaletteFromReference('#C8A2C8', 'secondary', 0);
    const second = generatePaletteFromReference('#C8A2C8', 'secondary', 2);
    expect(second.colors.secondary).toBe('#C8A2C8');
    expect(second.colors.accent).not.toBe(first.colors.accent);
  });
});
