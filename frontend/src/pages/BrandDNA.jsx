import React, { useEffect, useMemo, useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { calculateContrastRatio } from '../lib/consistencyAuditor';
import { readableTextColor } from '../lib/colorUtils';
import { CURATED_PALETTES } from '../data/curatedPalettes';
import { generatePaletteFromReference } from '../lib/paletteGenerator';
import { Check, LoaderCircle, Palette, RefreshCw, Sparkles, Type } from 'lucide-react';

const DESIGN_DIRECTIONS = [
  {
    id: 'editorial-bloom', name: 'Editorial Bloom', mood: 'Expressive · considered · premium', logoStyleToken: 'luxury',
    colors: { primary: '#432630', secondary: '#714956', accent: '#8D4153', surface: '#FBF5F1' },
    typography: { display: { family: 'Playfair Display', size: 48, weight: '700' }, headline: { family: 'DM Sans', size: 28, weight: '600' }, body: { family: 'DM Sans', size: 16, weight: '400' }, mono: { family: 'IBM Plex Mono', size: 12, weight: '500' } },
    rationale: { colors: 'A warm, ink-led palette balances a soft paper surface with a muted rose accent.', typography: 'Editorial contrast in the display face brings character; DM Sans keeps supporting copy direct.' }
  },
  {
    id: 'field-notes', name: 'Field Notes', mood: 'Grounded · organic · enduring', logoStyleToken: 'organic',
    colors: { primary: '#28483C', secondary: '#4B6957', accent: '#805527', surface: '#F4F3E9' },
    typography: { display: { family: 'Cormorant Garamond', size: 50, weight: '600' }, headline: { family: 'Manrope', size: 28, weight: '600' }, body: { family: 'Manrope', size: 16, weight: '400' }, mono: { family: 'IBM Plex Mono', size: 12, weight: '500' } },
    rationale: { colors: 'Forest green and warm stone feel connected to nature without leaning on bright eco clichés.', typography: 'Cormorant adds a human, crafted voice while Manrope stays clear at everyday reading sizes.' }
  },
  {
    id: 'signal-form', name: 'Signal / Form', mood: 'Precise · modern · confident', logoStyleToken: 'tech',
    colors: { primary: '#222C3A', secondary: '#46556A', accent: '#A84531', surface: '#F3F3EF' },
    typography: { display: { family: 'Space Grotesk', size: 48, weight: '700' }, headline: { family: 'DM Sans', size: 28, weight: '600' }, body: { family: 'DM Sans', size: 16, weight: '400' }, mono: { family: 'IBM Plex Mono', size: 12, weight: '500' } },
    rationale: { colors: 'A composed blue-gray base is sharpened by a warm signal coral for clear, deliberate emphasis.', typography: 'Space Grotesk gives the wordmark a technical edge; DM Sans keeps long-form information calm.' }
  },
  {
    id: 'after-hours', name: 'After Hours', mood: 'Expressive · distinctive · composed', logoStyleToken: 'bold',
    colors: { primary: '#38234E', secondary: '#624579', accent: '#566A10', surface: '#F6F1F8' },
    typography: { display: { family: 'Syne', size: 48, weight: '700' }, headline: { family: 'Manrope', size: 28, weight: '600' }, body: { family: 'Manrope', size: 16, weight: '400' }, mono: { family: 'IBM Plex Mono', size: 12, weight: '500' } },
    rationale: { colors: 'Deep plum creates a distinctive base; a muted olive accent adds definition without taking over.', typography: 'Syne makes the display voice expressive while Manrope keeps the rest of the system approachable.' }
  },
  {
    id: 'quiet-form', name: 'Quiet Form', mood: 'Restrained · tactile · clear', logoStyleToken: 'minimal',
    colors: { primary: '#292725', secondary: '#5B5650', accent: '#935139', surface: '#F3F0EA' },
    typography: { display: { family: 'DM Sans', size: 48, weight: '700' }, headline: { family: 'DM Sans', size: 28, weight: '600' }, body: { family: 'Manrope', size: 16, weight: '400' }, mono: { family: 'IBM Plex Mono', size: 12, weight: '500' } },
    rationale: { colors: 'Charcoal, soft stone, and clay keep the identity quiet but give actions a warm focal point.', typography: 'A disciplined sans pairing prioritizes legibility and lets spacing and materials carry the character.' }
  }
];

const paletteDistance = (first = {}, second = {}) => {
  const distances = ['primary', 'secondary', 'accent', 'surface'].map((role) => {
    const a = first[role];
    const b = second[role];
    if (!/^#[\da-f]{6}$/i.test(a || '') || !/^#[\da-f]{6}$/i.test(b || '')) return 0;
    const channelsA = [1, 3, 5].map((offset) => parseInt(a.slice(offset, offset + 2), 16));
    const channelsB = [1, 3, 5].map((offset) => parseInt(b.slice(offset, offset + 2), 16));
    return Math.sqrt(channelsA.reduce((sum, value, index) => sum + (value - channelsB[index]) ** 2, 0));
  });
  return { average: distances.reduce((sum, distance) => sum + distance, 0) / distances.length, primary: distances[0] };
};

const PALETTE_MATCH_TERMS = {
  'modern-editorial': ['fashion', 'lifestyle', 'creative', 'design', 'apparel', 'beauty'],
  'digital-electric': ['technology', 'tech', 'ai', 'saas', 'gaming', 'software', 'digital', 'robotics'],
  'botanical-luxury': ['skincare', 'wellness', 'organic', 'garden', 'gardening', 'plant', 'agriculture', 'natural', 'health'],
  'playful-pop': ['food', 'beverage', 'drink', 'youth', 'snack', 'cafe', 'restaurant'],
  'quiet-luxury': ['jewelry', 'jewellery', 'interior', 'premium', 'luxury', 'finance', 'real estate'],
  'coastal-fresh': ['travel', 'hospitality', 'summer', 'hotel', 'tourism', 'beach', 'resort']
};

const LEGACY_FONT_PAIRS = [
  ['Playfair Display', 'DM Sans'], ['Space Grotesk', 'Manrope'], ['Cormorant Garamond', 'Plus Jakarta Sans'],
  ['Syne', 'Inter'], ['DM Serif Display', 'Outfit'], ['Bodoni Moda', 'Work Sans'],
  ['Fraunces', 'Public Sans'], ['Archivo', 'Lora'], ['Unbounded', 'IBM Plex Sans'], ['Libre Baskerville', 'Montserrat']
];
const LEGACY_MONO_FONTS = ['IBM Plex Mono', 'DM Mono', 'JetBrains Mono', 'Space Mono', 'Roboto Mono'];
const LEGACY_LOGO_MARKS = {
  minimal: ['geometric_prism', 'minimal_circle_intersect', 'minimal_slash_square', 'minimal_stacked_bars', 'minimal_diamond_compass', 'minimal_offset_quad', 'minimal_bauhaus_portal', 'minimal_zen_ring'],
  tech: ['circuit_node', 'cube_dimension', 'quantum_orbit', 'neural_synapse', 'matrix_hex_core', 'binary_brackets', 'satellite_radar', 'spectrum_prism'],
  luxury: ['crest_diamond', 'crown_pillar', 'arch_monogram', 'fleur_sovereign', 'interlocking_gem', 'palais_monolith', 'solitaire_star', 'shield_crest_regal'],
  organic: ['botanical_leaf', 'solar_sprout', 'wave_ripple', 'twin_flora', 'terra_strata', 'seed_of_life', 'spiral_nautilus', 'sun_horizon'],
  bold: ['lightning_apex', 'shield_valor', 'nexus_burst', 'chevron_forge', 'monolith_pillar', 'impact_polygon', 'vortex_turbine', 'barricade_cross']
};

const personalizeLegacyDirections = (name, baseColors = {}) => {
  let seed = 2166136261;
  for (const char of String(name || 'brand')) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  seed >>>= 0;
  const rotateHue = (hex, angle) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255;
    const max = Math.max(r, g, b) / 255; const min = Math.min(r, g, b) / 255; const d = max - min;
    let h = 0;
    if (d) h = (max === r / 255 ? ((g - b) / 255) / d % 6 : max === g / 255 ? ((b - r) / 255) / d + 2 : ((r - g) / 255) / d + 4) * 60;
    h = ((h + angle) % 360 + 360) % 360;
    const s = max === 0 ? 0 : d / max; const v = max;
    const c = v * s; const x = c * (1 - Math.abs((h / 60) % 2 - 1)); const m = v - c;
    const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return `#${rgb.map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, '0')).join('')}`;
  };
  const soften = (hex) => {
    const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
    const gray = rgb.reduce((sum, channel) => sum + channel, 0) / 3;
    return `#${rgb.map((channel) => Math.round(channel * 0.55 + gray * 0.45).toString(16).padStart(2, '0')).join('')}`;
  };
  const ensureAA = (hex, surface) => {
    hex = soften(hex);
    if (calculateContrastRatio(hex, surface) >= 4.5) return hex;
    const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
    for (let step = 1; step <= 100; step += 1) {
      const candidate = `#${rgb.map((channel) => Math.round(channel * (1 - step / 100)).toString(16).padStart(2, '0')).join('')}`;
      if (calculateContrastRatio(candidate, surface) >= 4.5) return candidate;
    }
    return '#111111';
  };
  return DESIGN_DIRECTIONS.map((direction, index) => {
    const angle = (seed + index * 59) % 300 + 30;
    const surface = baseColors.surface || direction.colors.surface;
    const source = baseColors.primary || direction.colors.primary;
    const colors = {
      primary: ensureAA(rotateHue(source, angle), surface),
      secondary: ensureAA(rotateHue(baseColors.secondary || direction.colors.secondary, angle), surface),
      accent: ensureAA(rotateHue(baseColors.accent || direction.colors.accent, angle), surface),
      surface
    };
    const fontPair = LEGACY_FONT_PAIRS[(seed + index) % LEGACY_FONT_PAIRS.length];
    const logoOptions = LEGACY_LOGO_MARKS[direction.logoStyleToken] || LEGACY_LOGO_MARKS.minimal;
    return {
      ...direction,
      legacyId: direction.id,
      id: `${String(name || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
      logoMarkId: logoOptions[Math.floor(seed / LEGACY_LOGO_MARKS.minimal.length + index) % logoOptions.length],
      typography: {
        ...direction.typography,
        display: { ...direction.typography.display, family: fontPair[0] },
        headline: { ...direction.typography.headline, family: fontPair[1] },
        body: { ...direction.typography.body, family: fontPair[1] },
        mono: { ...direction.typography.mono, family: LEGACY_MONO_FONTS[(seed + index) % LEGACY_MONO_FONTS.length] }
      },
      colors
    };
  });
};

export const BrandDNA = () => {
  const { brand, applyBrandDirection, applyBrandPalette, isApplyingDirection } = useBrand();
  const [copiedHex, setCopiedHex] = useState(null);
  const [applyingDirectionId, setApplyingDirectionId] = useState(null);
  const [directionError, setDirectionError] = useState('');
  const [directionSaved, setDirectionSaved] = useState(false);
  const [exploreMode, setExploreMode] = useState(null);
  const [showMorePalettes, setShowMorePalettes] = useState(false);
  const [applyingPaletteId, setApplyingPaletteId] = useState(null);
  const [paletteDraft, setPaletteDraft] = useState(() => ({ primary: brand?.colors?.primary || '#34434A', secondary: brand?.colors?.secondary || '#667A7C', accent: brand?.colors?.accent || '#B46A72', surface: brand?.colors?.surface || '#F7F4EF' }));
  const [paletteReferenceRole, setPaletteReferenceRole] = useState('primary');
  const [paletteGenerated, setPaletteGenerated] = useState(false);
  const [paletteCharacter, setPaletteCharacter] = useState('');
  const [paletteVariation, setPaletteVariation] = useState(0);
  const directions = useMemo(() => Array.isArray(brand?.designDirections) && brand.designDirections.length
    ? brand.designDirections
    : personalizeLegacyDirections(brand?.companyName || brand?.company_name, brand?.colors), [brand?.designDirections, brand?.companyName, brand?.company_name, brand?.colors]);

  useEffect(() => {
    const families = [...new Set(directions.flatMap((direction) => [direction.typography?.display?.family, direction.typography?.body?.family]).filter(Boolean))];
    families.forEach((family) => {
      const id = `brand-font-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}&display=swap`;
      document.head.appendChild(link);
    });
  }, [directions]);

  const companyName = brand?.companyName || brand?.company_name || 'Your brand';
  const brandKey = brand?.brandId || brand?.id || brand?._id || companyName;
  useEffect(() => {
    setPaletteDraft({
      primary: brand?.colors?.primary || '#34434A',
      secondary: brand?.colors?.secondary || '#667A7C',
      accent: brand?.colors?.accent || '#B46A72',
      surface: brand?.colors?.surface || brand?.colors?.background || '#F7F4EF'
    });
    setPaletteGenerated(false);
    setPaletteCharacter('');
    setPaletteReferenceRole('primary');
  }, [brandKey, brand?.colors?.primary, brand?.colors?.secondary, brand?.colors?.accent, brand?.colors?.surface, brand?.colors?.background]);
  const tagline = brand?.tagline || '';
  const coreMantra = brand?.coreMantra || '';
  const visualDirection = brand?.visualDirection || brand?.visual_style_description || '';
  
  const personality = Array.isArray(brand?.personality) ? brand.personality : [];

  const coreValues = Array.isArray(brand?.coreValues) && brand.coreValues.length
    ? brand.coreValues
    : (Array.isArray(brand?.values) ? brand.values : []);

  const voiceTone = Array.isArray(brand?.voiceTone) && brand.voiceTone.length
    ? brand.voiceTone
    : (Array.isArray(brand?.tone_of_voice) ? brand.tone_of_voice : typeof brand?.tone_of_voice === 'string' ? [brand.tone_of_voice] : []);

  // Color Tokens
  const colors = brand?.colors || {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#738F80',
    surface: '#F8FAFC'
  };

  const surface = colors.surface || colors.background || '#F8FAFC';
  const primary = colors.primary || '#0F172A';
  const secondary = colors.secondary || '#1E293B';
  const accent = colors.accent || '#738F80';
  const heroInk = readableTextColor('#FFFDFC', primary, '#251B1E');

  // Typography Tokens
  const typography = brand?.typography || {
    display: { family: 'Syne', size: 48, weight: 'Bold' },
    headline: { family: 'Plus Jakarta Sans', size: 28, weight: 'SemiBold' },
    body: { family: 'Inter', size: 16, weight: 'Regular' },
    mono: { family: 'JetBrains Mono', size: 12, weight: 'Medium' }
  };

  const displayFont = typography.display?.family || typography.heading_font || 'Syne, sans-serif';
  const bodyFont = typography.body?.family || typography.body_font || 'Inter, sans-serif';
  const rationale = brand?.rationale || {};

  const handleCopy = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex(null), 1800);
    } catch (error) {
      setCopiedHex(null);
    }
  };

  const chooseDirection = async (direction) => {
    if (isApplyingDirection) return;
    setApplyingDirectionId(direction.id);
    setDirectionError('');
    setDirectionSaved(false);
    try {
      await applyBrandDirection(direction);
      setDirectionSaved(true);
      window.setTimeout(() => setDirectionSaved(false), 2400);
    } catch (error) {
      setDirectionError(error.message || 'Could not apply this direction.');
    } finally {
      setApplyingDirectionId(null);
    }
  };

  const chooseCuratedPalette = async (palette) => {
    if (isApplyingDirection) return;
    setApplyingPaletteId(palette.id);
    setDirectionError('');
    setDirectionSaved(false);
    try {
      await applyBrandPalette(palette);
      setDirectionSaved(true);
      window.setTimeout(() => setDirectionSaved(false), 2400);
    } catch (error) {
      setDirectionError(error.message || 'Could not apply this palette.');
    } finally {
      setApplyingPaletteId(null);
    }
  };

  const editPaletteColor = (role, value) => {
    setPaletteDraft((current) => ({ ...current, [role]: value }));
    setPaletteReferenceRole(role);
    setPaletteGenerated(false);
    setPaletteCharacter('');
  };

  const generateCustomPalette = (nextVariation = paletteVariation) => {
    try {
      const result = generatePaletteFromReference(paletteDraft[paletteReferenceRole], paletteReferenceRole, nextVariation);
      setPaletteDraft(result.colors);
      setPaletteCharacter(result.character);
      setPaletteVariation(nextVariation);
      setPaletteGenerated(true);
      setDirectionError('');
    } catch (error) {
      setDirectionError(error.message || 'Choose a valid color to generate a palette.');
    }
  };

  const applyCustomPalette = async () => {
    setApplyingPaletteId('custom-generated');
    setDirectionError('');
    try {
      await applyBrandPalette({ id: 'custom-generated', name: 'Custom generated', industry: `${paletteCharacter} color direction`, colors: paletteDraft });
      setDirectionSaved(true);
      window.setTimeout(() => setDirectionSaved(false), 2400);
    } catch (error) {
      setDirectionError(error.message || 'Could not apply this palette.');
    } finally {
      setApplyingPaletteId(null);
    }
  };

  const primaryContrast = calculateContrastRatio(primary, surface).toFixed(1);
  const selectedPaletteDirection = directions.find((direction) => brand?.designDirection === direction.id || brand?.designDirection === direction.legacyId)
    || directions.find((direction) => ['primary', 'secondary', 'accent', 'surface'].every((role) => String(direction.colors?.[role] || '').toUpperCase() === String(colors[role] || '').toUpperCase()));
  const activeDirectionId = brand?.designDirection || selectedPaletteDirection?.id;
  const aiSelectedDirectionId = directions[0]?.id;
  const alternateDirections = directions
    .filter((direction) => direction.id !== aiSelectedDirectionId && direction.id !== activeDirectionId && direction.id !== selectedPaletteDirection?.legacyId)
    .sort((first, second) => paletteDistance(colors, second.colors).average - paletteDistance(colors, first.colors).average)
    .slice(0, 3);
  const selectedCuratedPalette = CURATED_PALETTES.find((palette) => palette.id === brand?.paletteId);
  const isCustomPaletteApplied = brand?.paletteId === 'custom-generated';
  const brandKeywords = Array.isArray(brand?.keywords) && brand.keywords.length
    ? brand.keywords
    : [];
  const missingDetails = [
    !tagline && 'Tagline',
    !coreMantra && 'Mission statement',
    !personality.length && 'Personality',
    !brandKeywords.length && 'Keywords',
    !coreValues.length && 'Core values',
    !voiceTone.length && 'Voice & tone',
    !visualDirection && 'Visual direction'
  ].filter(Boolean);
  const brandContext = [brand?.industry, brand?.targetAudience, ...(brandKeywords || [])].filter(Boolean).join(' ').toLowerCase();
  const rankedCuratedPalettes = CURATED_PALETTES.map((palette) => {
    const relevance = (PALETTE_MATCH_TERMS[palette.id] || []).reduce((score, term) => score + (brandContext.includes(term) ? 1 : 0), 0);
    return { palette, relevance, distance: paletteDistance(colors, palette.colors).average };
  }).sort((first, second) => second.relevance - first.relevance || second.distance - first.distance);
  const recommendedPalettes = rankedCuratedPalettes.map(({ palette }) => palette).filter((palette) => palette.id !== brand?.paletteId).slice(0, 2);
  const additionalPalettes = rankedCuratedPalettes.map(({ palette }) => palette).filter((palette) => !recommendedPalettes.some((recommended) => recommended.id === palette.id));
  const visiblePalettes = showMorePalettes ? [...recommendedPalettes, ...additionalPalettes] : recommendedPalettes;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <section className="relative overflow-hidden rounded-[30px] p-6 shadow-[0_24px_64px_-42px_rgba(38,21,27,.48)] sm:p-9 lg:p-10" style={{ backgroundColor: primary, color: heroInk, '--brand-hero-ink': heroInk }}>
        <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-10 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative grid min-w-0 gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[var(--brand-hero-ink)] opacity-75"><Sparkles size={12}/> Brand DNA · AI strategy</span>
            <h1 className="mt-6 break-words text-4xl font-semibold leading-[.98] tracking-[-.065em] sm:text-6xl" style={{ fontFamily: displayFont }}>{companyName}</h1>
            <p className={`studio-serif mt-4 max-w-2xl text-xl italic leading-snug text-[var(--brand-hero-ink)] sm:text-2xl ${tagline ? 'opacity-85' : 'opacity-65'}`}>{tagline || 'No tagline has been added yet.'}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-medium text-[var(--brand-hero-ink)] opacity-75">
              {brand?.industry && <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{brand.industry}</span>}
              {brand?.targetAudience && <span className="max-w-full break-words whitespace-normal rounded-full border border-white/20 bg-white/10 px-3 py-1.5">For {brand.targetAudience}</span>}
            </div>
          </div>
          <div className="relative min-w-0 border-t border-white/20 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[var(--brand-hero-ink)] opacity-60">Mission statement</p>
            <p className={`mt-3 text-base leading-7 sm:text-lg ${coreMantra ? '' : 'opacity-70'}`} style={{ fontFamily: bodyFont }}>{coreMantra || 'No mission statement has been added yet.'}</p>
          </div>
        </div>
      </section>

      {missingDetails.length > 0 && <section role="status" aria-label="Missing brand details" className="flex flex-col gap-2 border-l-2 border-[#bd8995] py-2 pl-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-[#67565a]">Some brand details are missing from this identity.</p>
        <div className="flex flex-wrap gap-1.5">{missingDetails.map((detail) => <span key={detail} className="rounded-full bg-[#f6e9e9] px-2.5 py-1 text-[10px] font-semibold text-[#7b3448]">{detail} · missing</span>)}</div>
      </section>}

      <section className="grid gap-x-8 lg:grid-cols-[1.05fr_.95fr]" aria-label="Brand keywords and foundations">
        <article className="border-y border-[#eadfd9] py-5 sm:py-6 lg:pr-8">
          <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.17em] text-[#a08f91]">Brand vocabulary</p><h2 className="mt-1 text-lg font-semibold tracking-tight text-[#302729]">The words that define {companyName}</h2></div><span className="text-[9px] font-semibold uppercase tracking-wider text-[#b09fa0]">{brandKeywords.length} keywords</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{brandKeywords.length ? brandKeywords.map((word,index)=><span key={`${word}-${index}`} className={`rounded-full px-3.5 py-2 text-xs font-semibold ${index===0?'bg-[#6b2438] text-white':'border border-[#eadfd9] bg-[#fbf7f4] text-[#5c4b4f]'}`}>{word}</span>) : <p className="text-xs text-[#918184]">No brand keywords were generated.</p>}</div>
          {rationale.personality && <p className="mt-5 border-t border-[#f0e8e5] pt-4 text-xs leading-6 text-[#85787a]">{rationale.personality}</p>}
        </article>
        <article className="border-b border-[#eadfd9] py-5 sm:py-6 lg:border-y lg:border-l lg:pl-8">
          <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center text-[#8f4859]"><Type size={17}/></span><div><p className="text-[9px] font-bold uppercase tracking-[.17em] text-[#a08f91]">What guides the brand</p><h2 className="mt-0.5 text-base font-semibold text-[#302729]">Values & voice</h2></div></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#a08f91]">Core values</p><div className="mt-2 space-y-2">{coreValues.length ? coreValues.slice(0,3).map((value,index)=>{const title=typeof value==='string'?value:value.title;const desc=typeof value==='object'?value.description||value.desc:'';return <div key={`${title}-${index}`}><p className="text-xs font-semibold text-[#49383c]">{title}</p>{desc&&<p className="mt-0.5 text-[10px] leading-4 text-[#918184]">{desc}</p>}</div>;}) : <p className="text-[10px] text-[#918184]">No core values were generated.</p>}</div></div>
            <div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#a08f91]">Voice & tone</p><div className="mt-2 flex flex-wrap gap-1.5">{voiceTone.length ? voiceTone.map((tone,index)=><span key={`${tone}-${index}`} className="rounded-lg bg-[#f7f1ee] px-2.5 py-1.5 text-[10px] font-medium text-[#67565a]">{tone}</span>) : <p className="text-[10px] text-[#918184]">No voice and tone were generated.</p>}</div><p className="mt-3 text-[10px] leading-5 text-[#918184]">{visualDirection || 'No visual direction was generated.'}</p></div>
          </div>
        </article>
      </section>

      <section className="space-y-4" aria-labelledby="palette-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#8f4859]">01 / Color direction</p><h2 id="palette-heading" className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#302729]">A palette with a point of view.</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#85787a]">Start with the AI-selected palette for {companyName}. Each color is chosen to work as part of one system.</p></div>
          {directionSaved && <span role="status" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b2438]"><Check size={15}/> Palette applied</span>}
        </div>
        {directionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{directionError}</p>}
        <div className="overflow-hidden rounded-[26px] border border-[#eadfd9] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8e5] px-5 py-4 sm:px-6"><div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5e9eb] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#6b2438]"><Sparkles size={11}/> {selectedCuratedPalette ? 'Curated palette applied' : isCustomPaletteApplied ? 'Custom palette applied' : 'AI selected'}</span><h3 className="mt-2 text-base font-semibold text-[#392d30]">{selectedCuratedPalette?.name || (isCustomPaletteApplied ? 'Custom generated palette' : selectedPaletteDirection?.name || 'Your signature palette')}</h3><p className="mt-0.5 text-[11px] text-[#918184]">{selectedCuratedPalette?.industry || (isCustomPaletteApplied ? 'Generated from your selected color character.' : selectedPaletteDirection?.mood || 'A balanced palette built around your brand strategy.')}</p></div><span className="rounded-full border border-[#eadfd9] bg-[#fffaf7] px-3 py-1.5 text-[10px] font-semibold text-[#67565a]">Primary / surface contrast {primaryContrast}:1</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[["Primary",primary],['Secondary',secondary],['Accent',accent],['Surface',surface]].map(([label,hex],index)=><button key={label} type="button" onClick={()=>handleCopy(hex)} className={`group text-left ${index<3?'border-r border-[#f0e8e5]':''} ${index<2?'border-b sm:border-b-0':''} border-[#f0e8e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9e3d58]`} aria-label={`Copy ${label.toLowerCase()} color ${hex}`}>
              <span className="block h-20 transition group-hover:h-[88px] sm:h-28" style={{backgroundColor:hex}}/><span className="block p-3 sm:p-4"><span className="block text-[10px] font-semibold text-[#49383c]">{label}</span><span className="mt-1 block font-mono text-[10px] text-[#8e7c80]">{hex.toUpperCase()}</span></span>
            </button>)}
          </div>
          <div className="flex flex-col gap-2 border-t border-[#f0e8e5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="max-w-3xl text-xs leading-5 text-[#85787a]">{rationale.colors || selectedPaletteDirection?.rationale?.colors || 'A considered palette designed to make your brand feel distinctive and remain clear across digital and print.'}</p>{copiedHex&&<span aria-live="polite" className="shrink-0 text-[10px] font-semibold text-[#6b2438]">Copied {copiedHex}</span>}</div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#eadfd9] bg-[#fffdfb]">
          <div className="flex flex-col gap-3 border-b border-[#f0e8e5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><p className="text-xs font-semibold text-[#49383c]">Explore a different direction</p><p className="mt-0.5 text-[10px] text-[#918184]">Full identity options use palettes distinct from the AI-selected colors.</p></div><div className="inline-flex w-full rounded-full border border-[#eadfd9] bg-white p-1 sm:w-auto" role="group" aria-label="Explore brand options"><button type="button" aria-pressed={exploreMode === 'directions'} onClick={() => setExploreMode((mode) => mode === 'directions' ? null : 'directions')} className={`flex-1 rounded-full px-3 py-2 text-[10px] font-semibold transition sm:flex-none ${exploreMode === 'directions' ? 'bg-[#6b2438] text-white shadow-sm' : 'text-[#6b2438] hover:bg-[#faf4f3]'}`}>Full identity · {alternateDirections.length}</button><button type="button" aria-pressed={exploreMode === 'palettes'} onClick={() => { setExploreMode((mode) => mode === 'palettes' ? null : 'palettes'); setShowMorePalettes(false); }} className={`flex-1 rounded-full px-3 py-2 text-[10px] font-semibold transition sm:flex-none ${exploreMode === 'palettes' ? 'bg-[#6b2438] text-white shadow-sm' : 'text-[#6b2438] hover:bg-[#faf4f3]'}`}>Colors only · 2</button></div></div>
          {exploreMode === 'directions' && <div className="p-4 sm:p-5"><p className="mb-3 text-[10px] text-[#918184]">Each option changes the color story, typography, and logo direction.</p><div className="grid gap-3 md:grid-cols-3">{alternateDirections.map((direction)=>{const current=brand?.designDirection===direction.id||brand?.designDirection===direction.legacyId;const loading=isApplyingDirection&&applyingDirectionId===direction.id;const directionSurface=direction.colors.surface||'#F8FAFC';const minContrast=Math.min(...['primary','secondary','accent'].map((role)=>calculateContrastRatio(direction.colors[role],directionSurface)));return <article key={direction.id} className="overflow-hidden rounded-2xl border border-[#eadfd9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-20 overflow-hidden">{[direction.colors.primary,direction.colors.secondary,direction.colors.accent,direction.colors.surface].map((color,index)=><span key={`${color}-${index}`} className="flex-1" style={{backgroundColor:color}} title={color}/>)}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold text-[#392d30]">{direction.name}</h3>{current&&<span className="rounded-full bg-[#f5e8eb] px-2 py-0.5 text-[8px] font-bold uppercase text-[#6b2438]">Current</span>}</div><p className="mt-1 text-[10px] text-[#918184]">{direction.mood}</p><p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#786b6d]"><Type size={12}/>{direction.typography.display.family} + {direction.typography.body.family}</p><p className={`mt-2 text-[9px] font-semibold ${minContrast>=4.5?'text-emerald-700':'text-rose-700'}`}>Text contrast {minContrast.toFixed(1)}:1 · {minContrast>=4.5?'AA':'Review'}</p><button type="button" disabled={current||isApplyingDirection} onClick={()=>chooseDirection(direction)} className={`mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-default ${current?'border-[#ead9dd] bg-[#faf4f5] text-[#8b5361]':'border-[#e6d7d7] text-[#6b2438] hover:bg-[#fbf6f5]'}`}>{loading?<LoaderCircle size={14} className="animate-spin"/>:current?<Check size={14}/>:<Palette size={14}/>} {loading?'Applying…':current?'Applied':'Use this direction'}</button></div></article>;})}</div></div>}
          {exploreMode === 'palettes' && <div className="p-4 sm:p-5"><p className="mb-3 text-[10px] text-[#918184]">Two color alternatives matched to {brand?.industry || 'your brand'}; your current type and logo stay in place.</p><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visiblePalettes.map((palette) => {
          const current = brand?.paletteId === palette.id;
          const loading = applyingPaletteId === palette.id;
          const primaryRatio = calculateContrastRatio(palette.colors.primary, palette.colors.surface);
          return <article key={palette.id} className="overflow-hidden rounded-2xl border border-[#eadfd9] bg-white shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-[#f0e8e5] p-4"><div><h3 className="text-sm font-semibold text-[#392d30]">{palette.name}</h3><p className="mt-1 text-[10px] leading-4 text-[#918184]">{palette.industry}</p></div>{current && <span className="shrink-0 rounded-full bg-[#f5e8eb] px-2 py-1 text-[8px] font-bold uppercase text-[#6b2438]">Applied</span>}</div>
            <div className="grid gap-1 px-4 pt-4" style={{ gridTemplateColumns: `repeat(${palette.swatches.length}, minmax(0, 1fr))` }}>{palette.swatches.map(({ name, hex }) => <div key={name} className="min-w-0"><button type="button" onClick={() => handleCopy(hex)} aria-label={`Copy ${name} color ${hex}`} title={`${name} · ${hex}`} className="block h-9 w-full rounded-t-md sm:h-11" style={{ backgroundColor: hex }} /><p className="mt-2 truncate text-[7px] font-semibold uppercase tracking-wide text-[#8e7c80] sm:text-[8px]" title={name}>{name}</p><button type="button" onClick={() => handleCopy(hex)} aria-label={`Copy HEX ${hex}`} className="mt-0.5 block w-full truncate text-left font-mono text-[7px] text-[#67565a] sm:text-[8px]">{hex}</button></div>)}</div>
            <div className="px-4 pt-3"><p className="text-[9px] text-[#8b7c7e]">Primary / surface contrast {primaryRatio.toFixed(1)}:1{primaryRatio < 4.5 ? ' · use high-contrast ink for small text' : ' · AA'}</p></div>
            <div className="p-4 pt-3"><button type="button" disabled={current || isApplyingDirection} onClick={() => chooseCuratedPalette(palette)} className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-default ${current ? 'border-[#ead9dd] bg-[#faf4f5] text-[#8b5361]' : 'border-[#e6d7d7] text-[#6b2438] hover:bg-[#fbf6f5]'}`}>{loading ? <LoaderCircle size={14} className="animate-spin" /> : current ? <Check size={14} /> : <Palette size={14} />}{loading ? 'Applying…' : current ? 'Applied to this brand' : 'Apply palette'}</button></div>
          </article>;
        })}</div>{additionalPalettes.length > 0 && <button type="button" onClick={() => setShowMorePalettes((show) => !show)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#eadfd9] bg-white px-4 py-2 text-[10px] font-semibold text-[#6b2438] transition hover:bg-[#fbf6f5]">{showMorePalettes ? 'Show only the two recommendations' : `See all ${CURATED_PALETTES.length} palettes · ${additionalPalettes.length} more`}</button>}</div>}
        </div>
        <div className="overflow-hidden rounded-[24px] border border-[#eadfd9] bg-[#fffdfb] shadow-[0_12px_36px_-30px_rgba(73,56,60,.3)]">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f6e9eb] text-[#7b3448]"><Palette size={16}/></span><div><p className="text-sm font-semibold tracking-tight text-[#392d30]">Make it yours</p><p className="mt-1 max-w-xl text-[11px] leading-5 text-[#918184]">Choose a color to build around. EMBLEM will create a balanced palette and keep your chosen HEX exact.</p></div></div>
            <span className="ml-12 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.16em] text-[#a08f91] sm:ml-0"><span className="h-1.5 w-1.5 rounded-full bg-[#ad6576]"/>Color harmony</span>
          </div>
          <div className="mx-5 flex h-2 overflow-hidden rounded-full sm:mx-7" aria-label="Current custom palette preview">{[['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['surface', 'Surface']].map(([role]) => <span key={role} className="flex-1 transition-colors" style={{ backgroundColor: paletteDraft[role] }}/>)}</div>
          <div className="grid grid-cols-2 gap-px bg-[#f0e8e5] px-px pb-px sm:grid-cols-4">
            {[['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['surface', 'Surface']].map(([role, label]) => {
              const selected = paletteReferenceRole === role;
              return <div key={role} className={`relative flex min-w-0 items-center gap-3 bg-[#fffdfb] px-4 py-4 transition sm:px-5 ${selected ? 'bg-[#fcf7f5]' : ''}`}>
                <button type="button" onClick={() => setPaletteReferenceRole(role)} aria-pressed={selected} aria-label={`Build the palette around ${label.toLowerCase()}`} className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e3d58] ${selected ? 'border-[#8f4859] shadow-[0_0_0_3px_rgba(143,72,89,.1)]' : 'border-white shadow-sm'}`} style={{ backgroundColor: paletteDraft[role] }}><span className="sr-only">Select {label} as the anchor color</span>{selected && <span className="absolute inset-0 flex items-center justify-center bg-black/10 text-white"><Check size={15} strokeWidth={2.5}/></span>}</button>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate text-[10px] font-semibold text-[#49383c]">{label}</span>{selected && <span className="rounded-full bg-[#f5e9eb] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#7b3448]">Anchor</span>}</div><span className="mt-1 block truncate font-mono text-[10px] tracking-wide text-[#8e7c80]">{paletteDraft[role].toUpperCase()}</span></div>
                <label className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#eadfd9] bg-white text-[#7b3448] transition hover:border-[#bd8995] hover:bg-[#fbf6f5]" title={`Edit ${label.toLowerCase()} color`}><input type="color" value={paletteDraft[role]} aria-label={`Choose ${label} color`} onChange={(event) => editPaletteColor(role, event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0"/><span className="pointer-events-none text-base leading-none">+</span></label>
              </div>;
            })}
          </div>
          <div className="flex flex-col gap-4 border-t border-[#f0e8e5] bg-[#fbf7f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="min-h-8 text-[10px] leading-5 text-[#85787a]">{paletteGenerated ? <><span className="font-semibold capitalize text-[#6b2438]">{paletteCharacter}</span> character · built around <span className="font-semibold capitalize text-[#49383c]">{paletteReferenceRole}</span><span className={`ml-2 ${calculateContrastRatio(paletteDraft.primary, paletteDraft.surface) >= 4.5 ? 'text-emerald-700' : 'text-amber-700'}`}>· Primary contrast {calculateContrastRatio(paletteDraft.primary, paletteDraft.surface).toFixed(1)}:1</span></> : <>Select an anchor color, then generate a coordinated palette. <span className="font-medium text-[#6b2438]">{paletteReferenceRole}</span> is selected.</>}</div>
            <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => generateCustomPalette(paletteVariation + 1)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#6b2438] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#552031] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e3d58]"><RefreshCw size={13}/>{paletteGenerated ? 'Try another palette' : 'Generate palette'}</button>{paletteGenerated && <button type="button" disabled={isApplyingDirection} onClick={applyCustomPalette} className="inline-flex min-h-10 min-w-32 items-center justify-center gap-2 rounded-full border border-[#e6d7d7] bg-white px-4 text-xs font-semibold text-[#6b2438] transition hover:bg-[#fff8f7] disabled:opacity-60">{applyingPaletteId === 'custom-generated' ? <LoaderCircle size={14} className="animate-spin"/> : <Check size={14}/>}Apply palette</button>}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#eadfd9] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="type-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#f0e8e5] pb-4"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#8f4859]">02 / Typography</p><h2 id="type-heading" className="mt-1 text-xl font-semibold tracking-[-.03em] text-[#302729]">A voice you can see.</h2></div><span className="text-[10px] font-medium text-[#918184]">{displayFont} + {bodyFont}</span></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[#f8f3f1] p-5"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#a08f91]">Display · {typography.display?.size || 48}px</p><p className="mt-3 text-3xl font-bold tracking-tight text-[#302729]" style={{fontFamily:displayFont}}>Make it memorable.</p><p className="mt-2 text-[10px] text-[#918184]">{displayFont} · {typography.display?.weight || 'Bold'}</p></div>
          <div className="rounded-2xl border border-[#eee4df] p-5"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#a08f91]">Everyday · {typography.body?.size || 16}px</p><p className="mt-3 text-sm leading-6 text-[#49383c]" style={{fontFamily:bodyFont}}>A clear, considered voice gives every part of the brand room to speak.</p><p className="mt-2 text-[10px] text-[#918184]">{bodyFont} · {typography.body?.weight || 'Regular'}</p></div>
        </div>
        {rationale.typography&&<p className="mt-4 text-xs leading-6 text-[#85787a]">{rationale.typography}</p>}
      </section>
    </div>
  );
};

export default BrandDNA;
