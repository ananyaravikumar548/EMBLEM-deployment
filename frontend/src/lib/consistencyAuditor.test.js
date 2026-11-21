import { auditBrandConsistency } from './consistencyAuditor';
import { buildBrandLogos } from './vectorEngine';

const sampleBrand = {
  companyName: 'Fieldnote',
  tagline: 'Grow where you are.',
  logoStyleToken: 'organic',
  colors: { primary: '#244C3C', secondary: '#A8B86A', accent: '#D88C69', surface: '#FAF4E8' },
  typography: {
    display: { family: 'Fraunces', size: 48, weight: 'Bold' },
    headline: { family: 'DM Sans', size: 28, weight: 'SemiBold' },
    body: { family: 'DM Sans', size: 16, weight: 'Regular' },
    mono: { family: 'IBM Plex Mono', size: 12, weight: 'Medium' }
  }
};

function logoAssets(brand) {
  const logos = buildBrandLogos(brand);
  return Object.entries({
    logo_primary: logos.primary,
    logo_stacked: logos.stacked,
    logo_mark: logos.mark,
    logo_mono_light: logos.monoLight,
    logo_mono_dark: logos.monoDark
  }).map(([type, svg]) => ({ type, svgOrConfig: { svg, specs: logos.specs } }));
}

test('scores the logo files generated for the current brand', () => {
  const report = auditBrandConsistency({ ...sampleBrand, assets: logoAssets(sampleBrand) });
  expect(report.logoScore).toBe(100);
  expect(report.checks.filter((check) => check.category === 'logo').every((check) => check.passed)).toBe(true);
});

test('does not pass logo checks when supplied logo assets are malformed or missing specifications', () => {
  const report = auditBrandConsistency({
    ...sampleBrand,
    assets: [{ type: 'logo_primary', svgOrConfig: { svg: '<svg></svg>' } }]
  });
  expect(report.logoScore).toBe(0);
  expect(report.checks.filter((check) => check.category === 'logo').every((check) => !check.passed)).toBe(true);
});
