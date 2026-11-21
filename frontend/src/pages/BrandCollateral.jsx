import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, FileImage, Search, Sparkles, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useBrand } from '../context/BrandContext';
import { useCollateral, filterCollateral } from '../hooks/useCollateral';
import { getMarkSvgPath } from '../lib/vectorEngine';

const DEFAULT_COLORS = { primary: '#0F172A', secondary: '#1E293B', accent: '#738F80', surface: '#F8FAFC' };
const FILTERS = ['All', 'Print', 'Digital'];
export const BUSINESS_CARD_TEMPLATES = [
  { id: 'minimalist', name: 'Minimalist', note: 'Quiet type · generous space' },
  { id: 'modern', name: 'Modern', note: 'Structured asymmetry' },
  { id: 'elegant', name: 'Elegant', note: 'Refined editorial detail' },
  { id: 'bold', name: 'Bold', note: 'Confident color blocking' },
  { id: 'geometric', name: 'Geometric', note: 'Precise forms and lines' },
  { id: 'creative', name: 'Creative', note: 'Distinctive studio voice' }
];

const escapeXml = (value = '') => String(value).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));

function colorLuminance(hex) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a, b) {
  const first = colorLuminance(a);
  const second = colorLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function readableTextColor(preferred, background, fallback) {
  if (contrastRatio(preferred, background) >= 4.5) return preferred;
  return [fallback, '#FFFFFF', '#171313'].sort((a, b) => contrastRatio(b, background) - contrastRatio(a, background))[0];
}

function makeCollateralSvg(brand, item, side = 'front') {
  const name = escapeXml(brand.companyName || brand.company_name || 'EMBLEM');
  const tagline = escapeXml(brand.tagline || 'A clear point of view.');
  const colors = { ...DEFAULT_COLORS, ...(brand.colors || {}) };
  colors.surface = brand.colors?.surface || brand.colors?.background || DEFAULT_COLORS.surface;
  const primaryOnSurface = readableTextColor(colors.primary, colors.surface, '#171313');
  const surfaceOnPrimary = readableTextColor(colors.surface, colors.primary, '#FFFFFF');
  const accentOnPrimary = readableTextColor(colors.accent, colors.primary, colors.surface);
  const accentOnSurface = readableTextColor(colors.accent, colors.surface, colors.primary);
  const secondaryOnSurface = readableTextColor(colors.secondary, colors.surface, colors.primary);
  const type = item.type;
  const specs = {
    business_card: [side === 'both' ? 2100 : 1050, 600],
    letterhead: [2480, 3508],
    envelope: [2280, 990],
    social_post: [1080, 1080],
    social_story: [1080, 1920],
    social_banner: [1500, 500],
    email_signature: [640, 200],
    presentation: [1920, 1080]
  };
  const [width, height] = specs[type] || [1200, 800];
  const svgText = (x, y, text, size, fill, weight = 500, extra = '') => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${text}</text>`;
  const mark = getMarkSvgPath(brand.logoStyleToken || 'tech', name);
  let body = '';

  if (type === 'business_card') {
    const details = getBusinessCardDetails(brand);
    const contactLines = details.values.slice(0, 3).map(([label, value], index) => svgText(72, 330 + index * 52, value, 24, index === 2 ? accentOnSurface : primaryOnSurface, 500)).join('');
    const backText = svgText(72, 145, details.name || name, 54, primaryOnSurface, 700)
      + (details.title ? svgText(72, 205, details.title, 23, secondaryOnSurface, 500, 'letter-spacing="2"') : '')
      + contactLines;
    const card = (x, back = false) => `<g transform="translate(${x},0)"><rect width="1050" height="600" fill="${back ? colors.surface : colors.primary}"/>${back ? backText : `<g transform="translate(76,74) scale(4)" style="color:${accentOnPrimary}">${mark}</g>${svgText(280, 315, name, 78, surfaceOnPrimary, 700, 'letter-spacing="5"')}${svgText(284, 370, tagline, 24, accentOnPrimary, 500, 'letter-spacing="2"')}`}</g>`;
    body = side === 'both' ? `${card(0)}${card(1050, true)}` : card(0, side === 'back');
  } else if (type === 'letterhead') {
    body = `<rect width="100%" height="100%" fill="${colors.surface}"/><rect x="100" y="100" width="16" height="${height - 200}" fill="${colors.accent}"/><g transform="translate(170,140) scale(2)" style="color:${primaryOnSurface}">${mark}</g>${svgText(300, 230, name, 78, primaryOnSurface, 700, 'letter-spacing="4"')}${svgText(300, 290, tagline, 27, secondaryOnSurface)}<line x1="170" y1="390" x2="${width - 170}" y2="390" stroke="${colors.accent}" stroke-width="5"/><rect x="170" y="620" width="1320" height="24" rx="12" fill="#DDE2E6"/><rect x="170" y="690" width="2050" height="16" rx="8" fill="#E8EBED"/><rect x="170" y="745" width="1980" height="16" rx="8" fill="#E8EBED"/><rect x="170" y="800" width="1850" height="16" rx="8" fill="#E8EBED"/><line x1="170" y1="${height - 240}" x2="${width - 170}" y2="${height - 240}" stroke="${colors.accent}" stroke-width="4"/>${svgText(170, height - 165, tagline, 22, secondaryOnSurface)}${svgText(width - 170, height - 165, name, 22, primaryOnSurface, 700, 'text-anchor="end"')}`;
  } else if (type === 'envelope') {
    body = `<rect width="100%" height="100%" fill="${colors.surface}"/><rect x="0" y="0" width="20" height="100%" fill="${colors.primary}"/><line x1="100" y1="${height * 0.72}" x2="${width - 100}" y2="${height * 0.72}" stroke="${colors.accent}" stroke-width="6"/>${svgText(100, 205, name, 48, primaryOnSurface, 700, 'letter-spacing="4"')}${svgText(100, 258, tagline, 22, secondaryOnSurface)}${svgText(width - 100, height - 120, 'BUSINESS REPLY', 18, accentOnSurface, 700, 'text-anchor="end" letter-spacing="4"')}`;
  } else if (type === 'email_signature') {
    const email = 'name@yourdomain.com';
    const website = 'yourdomain.com';
    body = `<rect width="100%" height="100%" rx="18" fill="${colors.surface}"/><rect width="12" height="100%" rx="6" fill="${colors.accent}"/><rect x="40" y="42" width="116" height="116" rx="26" fill="${colors.primary}"/><g transform="translate(74,76) scale(1.4)" style="color:${accentOnPrimary}">${mark}</g><line x1="184" y1="36" x2="184" y2="164" stroke="${colors.accent}" stroke-width="3"/><text x="218" y="72" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="${colors.primary}">Your name</text><text x="218" y="101" font-family="Arial,sans-serif" font-size="15" fill="${secondaryOnSurface}">Your title</text><text x="218" y="133" font-family="Arial,sans-serif" font-size="14" fill="${colors.primary}">${email}</text><text x="218" y="157" font-family="Arial,sans-serif" font-size="14" fill="${accentOnSurface}">${website}</text><text x="600" y="67" text-anchor="end" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="${colors.primary}">${name}</text><text x="600" y="91" text-anchor="end" font-family="Arial,sans-serif" font-size="10" letter-spacing="1" fill="${secondaryOnSurface}">${tagline}</text>`;
  } else if (type === 'presentation') {
    const headline = escapeXml(brand.coreMantra || brand.tagline || 'A clearer way forward.');
    body = `<rect width="100%" height="100%" fill="${colors.surface}"/><rect x="0" y="0" width="700" height="1080" fill="${colors.primary}"/><circle cx="1610" cy="170" r="500" fill="${colors.accent}" opacity=".12"/><circle cx="1660" cy="180" r="340" fill="${colors.accent}" opacity=".12"/><rect x="110" y="112" width="112" height="112" rx="28" fill="${colors.accent}"/><g transform="translate(140,142) scale(1.6)" style="color:${colors.primary}">${mark}</g>${svgText(110, 390, name, 44, surfaceOnPrimary, 700, 'letter-spacing="5"')}${svgText(110, 445, 'BRAND PRESENTATION', 18, accentOnPrimary, 700, 'letter-spacing="4"')}${svgText(840, 500, headline, 74, colors.primary, 700)}<line x1="840" y1="610" x2="1630" y2="610" stroke="${colors.accent}" stroke-width="8"/>${svgText(840, 710, tagline, 30, secondaryOnSurface)}${svgText(840, 980, 'A BRAND OVERVIEW', 18, secondaryOnSurface, 700, 'letter-spacing="4"')}${svgText(1760, 980, '01 / 12', 18, colors.primary, 700, 'text-anchor="end" letter-spacing="2"')}`;
  } else {
    const isStory = type === 'social_story';
    const isBanner = type === 'social_banner';
    const titleSize = isBanner ? 56 : isStory ? 76 : 62;
    const left = isBanner ? 90 : isStory ? 95 : 100;
    const top = isBanner ? 210 : isStory ? 830 : 650;
    body = `<rect width="100%" height="100%" fill="${type === 'social_story' ? colors.surface : colors.primary}"/><circle cx="${width * 0.88}" cy="${height * 0.18}" r="${Math.min(width, height) * 0.23}" fill="${colors.accent}" opacity=".18"/><rect x="${left}" y="${isBanner ? 72 : 110}" width="${isBanner ? 105 : 92}" height="${isBanner ? 105 : 92}" rx="24" fill="${colors.accent}"/><g transform="translate(${left + (isBanner ? 26 : 22)},${(isBanner ? 72 : 110) + (isBanner ? 26 : 22)}) scale(1.05)" style="color:${type === 'social_story' ? primaryOnSurface : surfaceOnPrimary}">${mark}</g>${svgText(left, top, name, isBanner ? 42 : 32, type === 'social_story' ? accentOnSurface : accentOnPrimary, 700, 'letter-spacing="5"')}${svgText(left, top + titleSize + 28, tagline, titleSize, type === 'social_story' ? primaryOnSurface : surfaceOnPrimary, 700)}<rect x="${left}" y="${height - (isBanner ? 90 : 150)}" width="${isBanner ? 220 : 260}" height="8" rx="4" fill="${colors.accent}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function BrandMark({ brand, size = 38, inverse = false }) {
  const colors = { ...DEFAULT_COLORS, ...(brand.colors || {}) };
  colors.surface = brand.colors?.surface || brand.colors?.background || DEFAULT_COLORS.surface;
  const background = inverse ? colors.surface : colors.primary;
  const markColor = readableTextColor(inverse ? colors.primary : colors.accent, background, inverse ? colors.primary : colors.surface);
  const mark = getMarkSvgPath(brand.logoStyleToken || 'tech', brand.companyName || brand.company_name || 'EMBLEM');
  return <span className="inline-flex shrink-0 items-center justify-center rounded-xl" style={{ width: size, height: size, backgroundColor: background, color: markColor }}><svg width={size * 0.56} height={size * 0.56} viewBox="0 0 48 48" dangerouslySetInnerHTML={{ __html: mark }} /></span>;
}

function getBusinessCardDetails(brand) {
  const asset = Array.isArray(brand?.assets) ? brand.assets.find((entry) => entry.type === 'business_card') : null;
  const back = asset?.svgOrConfig?.back || {};
  const values = [
    ['Email', back.email || brand?.email || brand?.contactEmail],
    ['Phone', back.phone || brand?.phone || brand?.contactPhone],
    ['Web', back.website || brand?.website || brand?.url],
    ['Social', back.social || back.socialHandle || brand?.socialHandle || brand?.socialMedia]
  ].filter(([, value]) => typeof value === 'string' && value.trim());
  return {
    name: back.name || brand?.contactName || brand?.personName || '',
    title: back.title || brand?.contactTitle || brand?.jobTitle || '',
    values
  };
}

function FlippableBusinessCard({ company, front, back, initialSide, onSideChange, small = false }) {
  const [showBack, setShowBack] = useState(initialSide === 'back');
  const flipTimer = useRef(null);
  useEffect(() => {
    setShowBack(initialSide === 'back');
  }, [initialSide]);
  useEffect(() => () => window.clearTimeout(flipTimer.current), []);
  const flip = () => {
    const next = !showBack;
    setShowBack(next);
    if (initialSide !== 'both' && onSideChange) {
      window.clearTimeout(flipTimer.current);
      flipTimer.current = window.setTimeout(() => onSideChange(next ? 'back' : 'front'), 470);
    }
  };
  return <motion.button type="button" onClick={flip} aria-label={`Flip ${company} business card to its ${showBack ? 'front' : 'back'}`} whileHover={small ? undefined : { y: -3 }} whileTap={{ scale: 0.99 }} className={`relative aspect-[1.75/1] w-full ${small ? '' : 'max-w-[420px]'} [perspective:1200px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500`}>
    <motion.span animate={{ rotateY: showBack ? 180 : 0 }} transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 block [transform-style:preserve-3d]">
      <span className="absolute inset-0 block overflow-hidden [backface-visibility:hidden]">{front}</span>
      <span className="absolute inset-0 block overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</span>
    </motion.span>
  </motion.button>;
}

function BusinessCardTemplateArtwork({ brand, templateId, side = 'both', interactive = false, onSideChange = () => {}, small = false }) {
  const colors = { ...DEFAULT_COLORS, ...(brand?.colors || {}) };
  colors.surface = brand?.colors?.surface || brand?.colors?.background || DEFAULT_COLORS.surface;
  const company = brand?.companyName || brand?.company_name || 'EMBLEM';
  const tagline = brand?.tagline || '';
  const details = getBusinessCardDetails(brand);
  const ink = readableTextColor(colors.primary, colors.surface, '#171313');
  const inverse = readableTextColor(colors.surface, colors.primary, '#FFFFFF');
  const muted = readableTextColor(colors.secondary, colors.surface, ink);
  const accentInk = readableTextColor(colors.accent, colors.surface, ink);
  const type = brand?.typography?.display?.family;
  const isMini = small;
  const className = `relative flex aspect-[1.75/1] w-full flex-col overflow-hidden text-left ${isMini ? 'rounded-md p-2.5' : 'rounded-xl p-5 shadow-[0_22px_55px_-28px_rgba(20,17,18,.42)] sm:rounded-2xl sm:p-7'}`;

  const renderFace = (face) => {
    const isBack = face === 'back';
    const Component = motion.div;

    if (templateId === 'minimalist') return <Component className={`${className} justify-between`} style={{ backgroundColor: colors.surface, color: ink, border: `1px solid ${colors.secondary}35` }} whileHover={interactive ? { y: -3 } : undefined}>
      {isBack ? <><div className="flex items-start justify-between"><div><p className={`${isMini ? 'text-[7px]' : 'text-sm sm:text-base'} font-semibold`} style={{ fontFamily: type }}>{details.name || company}</p>{details.title && <p className={`${isMini ? 'text-[5px]' : 'mt-1 text-[9px]'} `} style={{ color: muted }}>{details.title}</p>}</div><BrandMark brand={brand} size={isMini ? 13 : 25} /></div><div className={`${isMini ? 'space-y-0.5 text-[5px]' : 'space-y-1 text-[8px] sm:text-[10px]'}`} style={{ color: muted }}>{details.values.map(([label, value]) => <p key={label} className="truncate">{value}</p>)}{details.values.length === 0 && tagline && <p className="line-clamp-2">{tagline}</p>}</div><span className="h-px w-full" style={{ backgroundColor: colors.accent }} /></> : <><div className="flex items-center gap-2"><BrandMark brand={brand} size={isMini ? 15 : 34} /><span className={`${isMini ? 'text-[8px]' : 'text-xl sm:text-2xl'} font-semibold tracking-tight`} style={{ fontFamily: type }}>{company}</span></div><div><span className="mb-2 block h-[2px] w-8" style={{ backgroundColor: colors.accent }} /><p className={`${isMini ? 'text-[5px]' : 'text-[8px] sm:text-[10px]'}`} style={{ color: muted }}>{tagline}</p></div></>}
    </Component>;

    if (templateId === 'modern') return <Component className={`${className} justify-between`} style={{ backgroundColor: isBack ? colors.primary : colors.surface, color: isBack ? inverse : ink }} whileHover={interactive ? { y: -3 } : undefined}>
      <span className="absolute inset-y-0 left-0 w-[28%]" style={{ backgroundColor: isBack ? colors.accent : colors.primary }} />
      <div className="relative ml-[32%] flex items-start justify-between"><div><p className={`${isMini ? 'text-[8px]' : 'text-xl sm:text-2xl'} font-bold`} style={{ fontFamily: type }}>{isBack ? (details.name || company) : company}</p><p className={`${isMini ? 'text-[5px]' : 'mt-1 text-[8px] sm:text-[10px]'}`} style={{ color: isBack ? `${inverse}B8` : muted }}>{isBack ? details.title : tagline}</p></div><BrandMark brand={brand} size={isMini ? 14 : 30} inverse={isBack} /></div>
      <div className={`relative ml-[32%] ${isMini ? 'text-[5px]' : 'text-[8px] sm:text-[10px]'}`} style={{ color: isBack ? inverse : muted }}>{isBack ? (details.values.map(([label, value]) => <p key={label} className="truncate">{value}</p>)) : <span className="font-mono uppercase tracking-[.14em]">{brand?.industry || 'Brand identity'}</span>}</div>
    </Component>;

    if (templateId === 'elegant') return <Component className={`${className} items-center justify-center text-center`} style={{ backgroundColor: colors.surface, color: ink, border: `1px solid ${colors.accent}85` }} whileHover={interactive ? { y: -3 } : undefined}>
      <span className="pointer-events-none absolute inset-2 border sm:inset-3" style={{ borderColor: `${colors.accent}70` }} />
      <BrandMark brand={brand} size={isMini ? 14 : 30} />
      <p className={`${isMini ? 'mt-1 text-[8px]' : 'mt-2 text-xl sm:text-2xl'} font-semibold`} style={{ fontFamily: type || 'Georgia, serif' }}>{isBack ? (details.name || company) : company}</p>
      <p className={`${isMini ? 'text-[5px]' : 'mt-1 text-[8px] sm:text-[10px]'}`} style={{ color: accentInk }}>{isBack ? details.title || details.values[0]?.[1] || tagline : tagline}</p>
      {isBack && <div className={`${isMini ? 'mt-1 text-[5px]' : 'mt-3 text-[8px] sm:text-[10px]'} relative space-y-0.5`} style={{ color: muted }}>{details.values.slice(0, 3).map(([label, value]) => <p key={label}>{value}</p>)}</div>}
    </Component>;

    if (templateId === 'bold') return <Component className={`${className} justify-between`} style={{ backgroundColor: isBack ? colors.surface : colors.primary, color: isBack ? ink : inverse }} whileHover={interactive ? { y: -3 } : undefined}>
      <span className="absolute inset-y-0 right-0 w-[18%]" style={{ backgroundColor: colors.accent }} />
      <div className="relative flex items-start justify-between"><BrandMark brand={brand} size={isMini ? 15 : 34} inverse={!isBack} /><span className={`${isMini ? 'text-[5px]' : 'text-[8px]'} font-mono uppercase tracking-[.18em]`}>{isBack ? 'Contact' : brand?.industry || 'Identity'}</span></div>
      <div className="relative pr-[16%]"><p className={`${isMini ? 'text-[9px]' : 'text-2xl sm:text-3xl'} font-black uppercase leading-none tracking-tight`} style={{ fontFamily: type }}>{isBack ? (details.name || company) : company}</p><p className={`${isMini ? 'mt-1 text-[5px]' : 'mt-2 text-[8px] sm:text-[10px]'}`} style={{ color: isBack ? muted : `${inverse}C8` }}>{isBack ? details.title || details.values[0]?.[1] || '' : tagline}</p></div>
      {isBack && <div className={`relative pr-[18%] ${isMini ? 'text-[5px]' : 'text-[8px] sm:text-[10px]'}`} style={{ color: muted }}>{details.values.slice(0, 3).map(([label, value]) => <p key={label} className="truncate">{value}</p>)}</div>}
    </Component>;

    if (templateId === 'geometric') return <Component className={`${className} justify-between`} style={{ backgroundColor: colors.surface, color: ink, border: `1px solid ${colors.secondary}45` }} whileHover={interactive ? { y: -3 } : undefined}>
      <span className="absolute -right-8 -top-9 h-24 w-24 rounded-full border-[10px]" style={{ borderColor: `${colors.accent}70` }} />
      <span className="absolute bottom-0 left-0 h-[5px] w-[38%]" style={{ backgroundColor: colors.primary }} />
      <div className="relative flex items-center gap-2"><BrandMark brand={brand} size={isMini ? 14 : 30} /><div><p className={`${isMini ? 'text-[8px]' : 'text-lg sm:text-xl'} font-bold`} style={{ fontFamily: type }}>{company}</p><p className={`${isMini ? 'text-[5px]' : 'text-[8px] sm:text-[10px]'}`} style={{ color: muted }}>{isBack ? details.name || details.title : tagline}</p></div></div>
      <div className={`relative grid grid-cols-2 gap-x-2 gap-y-0.5 ${isMini ? 'text-[5px]' : 'text-[8px] sm:text-[10px]'}`} style={{ color: accentInk }}>{isBack ? details.values.slice(0, 4).map(([label, value]) => <p key={label} className="truncate">{value}</p>) : <><span className="font-mono uppercase tracking-wider">{brand?.industry || 'Brand'}</span><span className="text-right">01 / 01</span></>}</div>
    </Component>;

    return <Component className={`${className} justify-between`} style={{ backgroundColor: isBack ? colors.primary : colors.surface, color: isBack ? inverse : ink }} whileHover={interactive ? { y: -3 } : undefined}>
      <span className="absolute inset-y-0 left-0 w-[16%]" style={{ backgroundColor: colors.accent }} />
      <div className="relative ml-[20%] flex items-start justify-between"><div><p className={`${isMini ? 'text-[8px]' : 'text-xl sm:text-2xl'} font-semibold`} style={{ fontFamily: type }}>{isBack ? details.name || company : company}</p><p className={`${isMini ? 'text-[5px]' : 'mt-1 text-[8px] sm:text-[10px]'}`} style={{ color: isBack ? `${inverse}B8` : muted }}>{isBack ? details.title : tagline}</p></div><BrandMark brand={brand} size={isMini ? 13 : 28} inverse={isBack} /></div>
      <div className={`relative ml-[20%] ${isMini ? 'text-[5px]' : 'text-[8px] sm:text-[10px]'}`} style={{ color: isBack ? inverse : accentInk }}>{isBack ? details.values.slice(0, 3).map(([label, value]) => <p key={label} className="truncate">{value}</p>) : <span className="font-mono uppercase tracking-widest">{brand?.industry || 'Independent by design'}</span>}</div>
    </Component>;
  };

  if (interactive && side !== 'both') {
    return <div className={`flex w-full flex-wrap items-center justify-center ${small ? 'gap-1.5' : 'gap-4 sm:gap-5'}`}>
      <div className={small ? 'w-full' : 'w-full max-w-[420px]'}><FlippableBusinessCard company={company} front={renderFace('front')} back={renderFace('back')} initialSide={side} onSideChange={onSideChange} small={small} /></div>
    </div>;
  }
  const faces = side === 'both' ? ['front', 'back'] : [side];
  return <div className={`flex w-full flex-wrap items-center justify-center ${small ? 'gap-1.5' : 'gap-4 sm:gap-5'}`}>
    {faces.map((face) => <div key={face} className={small ? 'w-[calc(50%-0.375rem)]' : 'w-full max-w-[420px] flex-1'}>{renderFace(face)}</div>)}
  </div>;
}

export function BusinessCardDesignExplorer({ brand, view, setView, selectedTemplateId, setSelectedTemplateId, appliedTemplateId, onClose, onConfirm }) {
  const [previewSide, setPreviewSide] = useState('both');
  useEffect(() => { setPreviewSide('both'); }, [selectedTemplateId]);
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  const selectedTemplate = BUSINESS_CARD_TEMPLATES.find((template) => template.id === selectedTemplateId) || BUSINESS_CARD_TEMPLATES[0];

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#171313]/65 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.section initial={{ opacity: 0, y: 18, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.99 }} transition={{ duration: 0.22 }} role="dialog" aria-modal="true" aria-labelledby="business-card-explorer-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-[#fbf8f5] shadow-[0_32px_100px_-28px_rgba(0,0,0,.5)]">
      <header className="flex items-start justify-between gap-4 border-b border-[#e9dfd9] bg-white px-5 py-4 sm:px-7 sm:py-5"><div><p className="font-mono text-[9px] font-semibold uppercase tracking-[.2em] text-[#9b737c]">Studio / Business cards</p><h2 id="business-card-explorer-title" className="mt-1 text-xl font-semibold tracking-tight text-[#302729] sm:text-2xl">{view === 'browse' ? 'Explore card designs' : selectedTemplate.name}</h2><p className="mt-1 text-xs text-[#85787a]">{view === 'browse' ? 'Six distinct directions, built with your brand details and colors.' : selectedTemplate.note}</p></div><button type="button" onClick={onClose} aria-label="Close business card designs" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e9dfd9] text-[#6f5f62] transition hover:bg-[#faf5f2]"><X size={17}/></button></header>
      {view === 'browse' ? <div className="min-h-0 overflow-y-auto p-4 sm:p-6"><div className="mb-4 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-widest text-[#9b8b8d]">{BUSINESS_CARD_TEMPLATES.length} templates</span><span className="text-[10px] text-[#918184]">Scroll to explore</span></div><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">{BUSINESS_CARD_TEMPLATES.map((template) => <button type="button" key={template.id} onClick={() => { setSelectedTemplateId(template.id); setView('preview'); }} aria-label={`Preview ${template.name} business card design`} className={`w-[290px] shrink-0 snap-start rounded-2xl border p-3 text-left transition ${appliedTemplateId === template.id ? 'border-[#6b2438] bg-[#fffafa] shadow-[0_0_0_2px_rgba(107,36,56,.1)]' : 'border-[#e8ddd7] bg-white hover:-translate-y-0.5 hover:border-[#bca3a2] hover:shadow-lg'}`}><div className="flex min-h-32 items-center rounded-xl bg-[#f4f0ed] p-3"><BusinessCardTemplateArtwork brand={brand} templateId={template.id} side="both" small /></div><div className="mt-3 flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-[#392d30]">{template.name}</h3><p className="mt-1 text-[10px] text-[#918184]">{template.note}</p></div>{appliedTemplateId === template.id && <span className="rounded-full bg-[#f5e9eb] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#6b2438]">Current</span>}</div></button>)}</div></div> : <div className="min-h-0 overflow-y-auto p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex gap-1 rounded-xl border border-[#e8ddd7] bg-white p-1">{['both', 'front', 'back'].map((side) => <button type="button" key={side} onClick={() => setPreviewSide(side)} aria-pressed={previewSide === side} className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold capitalize ${previewSide === side ? 'bg-[#6b2438] text-white' : 'text-[#746669]'}`}>{side}</button>)}</div><span className="font-mono text-[9px] uppercase tracking-wider text-[#9b8b8d]">Print ratio · 3.5 × 2 in</span></div><div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#e9dfd9] bg-[#f3efeb] p-4 sm:min-h-[430px] sm:p-8"><BusinessCardTemplateArtwork brand={brand} templateId={selectedTemplate.id} side={previewSide} interactive={previewSide !== 'both'} onSideChange={setPreviewSide}/></div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#85787a]">Preview both sides before applying. Your brand details and current palette stay in place.</p><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setView('browse')} className="rounded-xl border border-[#e3d7d3] bg-white px-4 py-2.5 text-xs font-semibold text-[#6b2438] transition hover:bg-[#fbf6f5]">Back to designs</button><button type="button" onClick={() => onConfirm(selectedTemplate.id)} className="inline-flex items-center gap-2 rounded-xl bg-[#6b2438] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#552031]"><Check size={14}/>Confirm design</button></div></div></div>}
    </motion.section>
  </motion.div>;
}

function AssetArtwork({ brand, item, side, onSideChange, cardTemplateId }) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [nextSlide, setNextSlide] = useState(false);
  useEffect(() => {
    setEnvelopeOpen(false);
    setNextSlide(false);
  }, [item.id]);

  const colors = { ...DEFAULT_COLORS, ...(brand.colors || {}) };
  colors.surface = brand.colors?.surface || brand.colors?.background || DEFAULT_COLORS.surface;
  const primaryOnSurface = readableTextColor(colors.primary, colors.surface, '#171313');
  const surfaceOnPrimary = readableTextColor(colors.surface, colors.primary, '#FFFFFF');
  const accentOnPrimary = readableTextColor(colors.accent, colors.primary, colors.surface);
  const accentOnSurface = readableTextColor(colors.accent, colors.surface, colors.primary);
  const secondaryOnSurface = readableTextColor(colors.secondary, colors.surface, colors.primary);
  const companyName = brand.companyName || brand.company_name || 'EMBLEM';
  const title = item.svgOrConfig?.headline || brand.coreMantra || brand.tagline || 'A clearer way forward.';
  if (item.type === 'business_card') {
    if (cardTemplateId) return <BusinessCardTemplateArtwork brand={brand} templateId={cardTemplateId} side={side} interactive onSideChange={onSideChange} />;
    const contact = getBusinessCardDetails(brand);
    const Card = ({ back = false, index = 0 }) => <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: index * 0.06 }} className="relative flex aspect-[1.75/1] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-black/5 p-6 text-left shadow-[0_28px_65px_-28px_rgba(20,17,18,.55)] [transform-style:preserve-3d] sm:p-8" style={{ backgroundColor: back ? colors.surface : colors.primary, color: back ? primaryOnSurface : surfaceOnPrimary }}>
      <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full blur-3xl" style={{ backgroundColor: `${colors.accent}35` }} />
      <div className="relative flex items-start justify-between">
        {back ? <div><p className="text-lg font-bold" style={{ fontFamily: brand.typography?.display?.family }}>{contact.name || companyName}</p>{contact.title && <p className="mt-1 text-xs opacity-65">{contact.title}</p>}</div> : <BrandMark brand={brand} size={38} inverse />}
        <span className="font-mono text-[9px] uppercase tracking-[.22em] opacity-45">{back ? 'Contact' : 'Identity'}</span>
      </div>
      <div className="relative">
        {!back && <p className="text-2xl font-extrabold tracking-[.1em] sm:text-3xl" style={{ fontFamily: brand.typography?.display?.family }}>{companyName}</p>}
        <p className="mt-2 max-w-[28rem] text-[10px] uppercase tracking-[.12em] opacity-70 sm:text-xs" style={{ color: back ? secondaryOnSurface : accentOnPrimary }}>{back ? contact.values[0]?.[1] || '' : brand.tagline}</p>
      </div>
      <div className="relative flex items-center justify-between border-t border-current/15 pt-3 font-mono text-[9px] uppercase tracking-wider opacity-65"><span>{back ? contact.values[1]?.[1] || 'Contact details' : 'Brand identity system'}</span><span>{back ? contact.values[2]?.[1] || '' : brand.industry || ''}</span></div>
    </motion.div>;
    const front = <Card />;
    const back = <Card back />;
    if (side === 'both') return <div className="flex w-full flex-wrap items-center justify-center gap-5"><div className="w-full max-w-[420px] flex-1">{front}</div><div className="w-full max-w-[420px] flex-1">{back}</div></div>;
    return <div className="flex w-full max-w-[520px] items-center justify-center"><FlippableBusinessCard company={companyName} front={front} back={back} initialSide={side} onSideChange={onSideChange} /></div>;
  }

  if (item.type === 'letterhead') return <div className="relative flex aspect-[.707/1] w-full max-w-[440px] flex-col bg-white p-7 shadow-[0_24px_60px_-34px_rgba(20,17,18,.4)] sm:p-10" style={{ color: primaryOnSurface }}><div className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: colors.accent }} /><div className="flex items-start gap-3 border-b border-neutral-100 pb-5"><BrandMark brand={brand} size={34} /><div><p className="font-bold tracking-wider" style={{ fontFamily: brand.typography?.display?.family }}>{companyName}</p><p className="mt-1 text-[9px] text-neutral-400">{brand.tagline}</p></div></div><div className="my-auto space-y-3"><span className="block h-2 w-1/3 rounded bg-neutral-300"/><span className="block h-1 w-full rounded bg-neutral-100"/><span className="block h-1 w-[94%] rounded bg-neutral-100"/><span className="block h-1 w-[82%] rounded bg-neutral-100"/><span className="block h-1 w-full rounded bg-neutral-100"/><span className="block h-1 w-3/4 rounded bg-neutral-100"/></div><div className="flex justify-between border-t-2 pt-3 font-mono text-[8px] text-neutral-400" style={{ borderColor: colors.accent }}><span>BRAND STATIONERY</span><span>{companyName.toUpperCase()}</span></div></div>;

  if (item.type === 'envelope') return <div className="flex w-full max-w-[620px] flex-col items-center"><motion.button type="button" aria-expanded={envelopeOpen} aria-label={envelopeOpen ? 'Return letter to envelope' : 'Slide letter out of envelope'} onClick={() => setEnvelopeOpen(!envelopeOpen)} whileHover={{ y: -3 }} whileTap={{ scale: 0.995 }} className="group relative mt-16 flex aspect-[2.3/1] w-full items-end overflow-visible rounded-2xl border border-neutral-200 bg-white p-0 text-left shadow-[0_28px_70px_-38px_rgba(20,17,18,.48)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500" style={{ perspective: 1000 }}><motion.div animate={{ y: envelopeOpen ? -132 : 0, zIndex: envelopeOpen ? 20 : 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-[13%] top-[-28%] flex h-[88%] flex-col justify-between rounded-t-sm border border-neutral-200 bg-white px-7 py-5 shadow-[0_16px_34px_-18px_rgba(20,17,18,.3)] sm:px-10 sm:py-7" style={{ color: primaryOnSurface }}><div className="flex items-center justify-between"><span className="font-mono text-[8px] uppercase tracking-[.22em]" style={{ color: colors.accent }}>{companyName} · A NOTE FOR YOU</span><span className="font-mono text-[8px] text-neutral-400">01</span></div><div><p className="max-w-[28rem] text-base font-semibold leading-snug sm:text-xl" style={{ fontFamily: brand.typography?.display?.family }}>{brand.tagline || 'A thoughtful note, just for you.'}</p><span className="mt-3 block h-[2px] w-10 rounded-full" style={{ backgroundColor: colors.accent }} /></div></motion.div><div className="relative z-10 flex h-full w-full items-center justify-between overflow-hidden rounded-2xl bg-white px-6 py-5 sm:px-9 sm:py-7"><div className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: colors.primary }} /><div className="flex min-w-0 items-center gap-4"><BrandMark brand={brand} size={42} /><div className="min-w-0"><p className="truncate text-sm font-bold tracking-[.12em] sm:text-base" style={{ color: primaryOnSurface }}>{companyName}</p><p className="mt-1 max-w-[18rem] truncate text-[9px] text-neutral-400 sm:text-[10px]">{brand.tagline}</p><div className="mt-4 h-px w-32 bg-neutral-200" /></div></div><div className="ml-4 hidden shrink-0 text-right sm:block"><span className="relative mb-2 ml-auto flex h-12 w-12 items-center justify-center rounded-sm border border-dashed" style={{ borderColor: `${colors.primary}70`, backgroundColor: `${colors.accent}12` }} aria-hidden="true"><span className="absolute inset-[3px] border" style={{ borderColor: `${colors.accent}55` }} /><BrandMark brand={brand} size={25} /><span className="absolute bottom-1 right-1 font-mono text-[5px] font-semibold leading-none" style={{ color: primaryOnSurface }}>01</span></span><p className="font-mono text-[8px] uppercase tracking-[.16em] text-neutral-400">First class · mail</p></div><div className="absolute bottom-0 left-0 h-1 w-full" style={{ backgroundColor: colors.accent }} /></div></motion.button><span className="mt-3 font-mono text-[8px] uppercase tracking-[.18em] text-neutral-400">{envelopeOpen ? 'Click to slide the letter back in' : 'Click the envelope to reveal the letter'}</span></div>;

  if (item.type === 'email_signature') return <div className="relative flex w-full max-w-[680px] items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_20px_52px_-34px_rgba(20,17,18,.42)] sm:p-7">
    <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: colors.accent }} />
    <BrandMark brand={brand} size={58} />
    <div className="h-16 w-px shrink-0" style={{ backgroundColor: colors.accent }} />
    <div className="min-w-0 flex-1"><p className="truncate text-base font-bold text-neutral-900 sm:text-lg">Your name</p><p className="mt-0.5 text-[10px] text-neutral-500 sm:text-xs">Your title</p><p className="mt-3 truncate text-[10px] font-medium sm:text-xs" style={{ color: primaryOnSurface }}>name@yourdomain.com</p><p className="mt-1 truncate text-[10px] sm:text-xs" style={{ color: accentOnSurface }}>yourdomain.com</p><p className="mt-2 text-[8px] font-semibold uppercase tracking-wider text-neutral-400">Replace with your contact details</p></div>
    <div className="hidden max-w-40 border-l border-neutral-100 pl-4 text-right lg:block"><p className="text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: primaryOnSurface }}>{companyName}</p><p className="mt-1 line-clamp-2 text-[9px] leading-4 text-neutral-400">{brand.tagline}</p></div>
  </div>;

  if (item.type === 'presentation') {
    const values = Array.isArray(brand.coreValues) && brand.coreValues.length ? brand.coreValues.slice(0, 3) : (Array.isArray(brand.personality) ? brand.personality.slice(0, 3) : []);
    const principles = values.length ? values : ['Purpose', 'Craft', 'Progress'];
    const principleTitle = (value) => typeof value === 'string' ? value : value?.title || value?.name || 'Principle';
    const principleDetail = (value) => typeof value === 'object' ? value.description || value.desc || '' : '';
    return <AnimatePresence mode="wait" initial={false}>
      {!nextSlide ? <motion.div key="cover" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.28 }} className="relative flex aspect-video w-full max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative flex w-[35%] shrink-0 flex-col justify-between overflow-hidden p-5 sm:p-9" style={{ backgroundColor: colors.primary, color: surfaceOnPrimary }}><div className="absolute -bottom-10 -left-16 h-48 w-48 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: colors.accent }} /><div className="relative"><BrandMark brand={brand} size={42} inverse /><p className="mt-5 font-mono text-[8px] uppercase tracking-[.2em] opacity-70 sm:text-[10px]">Brand presentation</p></div><div className="relative"><p className="text-xs font-bold uppercase tracking-[.18em] sm:text-sm">{companyName}</p><p className="mt-1 text-[8px] opacity-55 sm:text-[10px]">Identity overview · 2026</p></div></div>
        <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden p-5 sm:p-10"><div className="absolute -right-14 -top-20 h-48 w-48 rounded-full" style={{ backgroundColor: `${colors.accent}18` }} /><p className="relative font-mono text-[8px] font-semibold uppercase tracking-[.2em] sm:text-[10px]" style={{ color: accentOnSurface }}>A clear point of view</p><h3 className="relative mt-3 max-w-xl text-base font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl" style={{ fontFamily: brand.typography?.display?.family }}>{brand.coreMantra || brand.tagline || 'A clearer way forward.'}</h3><p className="relative mt-3 max-w-lg text-[8px] leading-relaxed text-neutral-500 sm:mt-5 sm:text-xs">{brand.visual_style_description || brand.visualDirection || brand.tagline}</p><div className="relative mt-5 h-1 w-12 rounded-full sm:mt-8 sm:w-20" style={{ backgroundColor: colors.accent }} /><div className="absolute bottom-4 right-5 flex items-center gap-2 sm:bottom-7 sm:right-9"><span className="font-mono text-[8px] text-neutral-400 sm:text-[10px]">01 / 12</span><button type="button" aria-label="Go to brand principles slide" onClick={() => setNextSlide(true)} className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"><ChevronRight size={13} /></button></div></div>
      </motion.div> : <motion.div key="principles" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.28 }} className="relative grid aspect-video w-full max-w-[960px] grid-cols-[.78fr_1.22fr] overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ color: primaryOnSurface }}>
        <div className="relative flex flex-col justify-between overflow-hidden p-5 sm:p-9" style={{ backgroundColor: colors.surface }}><div className="absolute -left-16 -top-12 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: colors.accent }} /><div className="relative flex items-center gap-3"><BrandMark brand={brand} size={34} /><span className="font-mono text-[8px] uppercase tracking-[.18em] text-neutral-500 sm:text-[10px]">{companyName} · Brand foundations</span></div><div className="relative"><p className="font-mono text-[9px] font-semibold uppercase tracking-[.2em]" style={{ color: accentOnSurface }}>02 / What guides us</p><h3 className="mt-4 text-2xl font-semibold leading-[1.05] tracking-tight sm:text-4xl" style={{ fontFamily: brand.typography?.display?.family }}>Principles with purpose.</h3><p className="mt-4 max-w-xs text-[9px] leading-relaxed text-neutral-500 sm:text-xs">{brand.missionStatement || brand.mission_statement || brand.visual_style_description || 'A clear foundation for every brand expression.'}</p></div><div className="relative flex items-center justify-between border-t border-neutral-200 pt-3 font-mono text-[8px] uppercase tracking-wider text-neutral-400"><span>{brand.industry || brand.industryCategory || 'Brand system'}</span><span>02 / 12</span></div></div>
        <div className="flex min-w-0 flex-col justify-center bg-white px-3 py-3 sm:px-10 sm:py-10">{principles.map((value, index) => <div key={`${principleTitle(value)}-${index}`} className="flex gap-2 border-b border-neutral-200 py-2 last:border-0 sm:gap-6 sm:py-5"><span className="pt-0.5 font-mono text-[7px] sm:pt-1 sm:text-[9px]" style={{ color: colors.accent }}>0{index + 1}</span><div className="min-w-0"><h4 className="text-[10px] font-semibold sm:text-lg" style={{ fontFamily: brand.typography?.display?.family }}>{principleTitle(value)}</h4><p className="mt-1 hidden max-w-lg text-[8px] leading-relaxed text-neutral-500 sm:block sm:text-[11px]">{principleDetail(value) || brand.visualDirection || brand.visual_style_description || brand.tagline || 'A defining idea, expressed consistently across the brand.'}</p></div></div>)}<div className="mt-1 flex items-center justify-between"><span className="truncate font-mono text-[6px] uppercase tracking-[.12em] text-neutral-400 sm:text-[8px] sm:tracking-[.16em]">{companyName} · Identity system</span><button type="button" aria-label="Return to presentation cover" onClick={() => setNextSlide(false)} className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950 sm:h-7 sm:w-7"><ChevronLeft size={13} /></button></div></div>
      </motion.div>}
    </AnimatePresence>;
  }

  const isStory = item.type === 'social_story';
  const isBanner = item.type === 'social_banner';
  const bg = item.type === 'social_story' ? colors.surface : colors.primary;
  const fg = item.type === 'social_story' ? primaryOnSurface : surfaceOnPrimary;
  return <div className={`group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl p-7 shadow-[0_24px_58px_-32px_rgba(20,17,18,.52)] sm:p-10 ${isBanner ? 'aspect-[3/1] max-w-[720px]' : isStory ? 'aspect-[9/16] max-w-[320px]' : 'aspect-square max-w-[440px]'}`} style={{ backgroundColor: bg, color: fg }}>
    <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: `${colors.accent}25` }} />
    <div className="relative flex items-center gap-3"><BrandMark brand={brand} size={isBanner ? 36 : 42} inverse={item.type !== 'social_story'} /><span className="font-mono text-[10px] uppercase tracking-[.25em]" style={{ color: item.type === 'social_story' ? accentOnSurface : accentOnPrimary }}>{companyName}</span></div>
    <div className="relative"><p className="mb-3 font-mono text-[10px] uppercase tracking-[.24em]" style={{ color: item.type === 'social_story' ? accentOnSurface : accentOnPrimary }}>{item.type.replace('social_', 'SOCIAL / ').replace('_', ' ')}</p><h3 className={`font-extrabold leading-[1.04] tracking-tight ${isBanner ? 'text-2xl sm:text-4xl' : isStory ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl'}`} style={{ fontFamily: brand.typography?.display?.family }}>{title}</h3><p className="mt-4 max-w-[28rem] text-xs opacity-65">{brand.visual_style_description || brand.visualDirection || brand.tagline}</p></div>
    <div className="relative flex items-center justify-between border-t border-current/15 pt-4 text-[9px] font-mono uppercase tracking-wider opacity-60"><span>Make your mark</span><span>{companyName}</span></div>
  </div>;
}

function EmptyAssets({ onCreate }) {
  return <div className="flex min-h-[440px] flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500"><Sparkles size={22} /></span><h2 className="text-xl font-bold">Your collateral will appear here</h2><p className="mt-2 max-w-sm text-sm text-neutral-500">Generate a brand identity to build stationery and digital assets from its design system.</p><button type="button" onClick={onCreate} className="mt-5 rounded-full bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white">Create a brand</button></div>;
}

export default function BrandCollateral({ onCreate }) {
  const { brand, updateBrandTokens, saveBrandProfile } = useBrand();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [side, setSide] = useState('both');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [templateView, setTemplateView] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(BUSINESS_CARD_TEMPLATES[0].id);
  const [appliedTemplateId, setAppliedTemplateId] = useState('');
  const assetRailRef = useRef(null);
  const { collateral } = useCollateral(brand?.assets || []);
  const visibleAssets = useMemo(() => filterCollateral(collateral, filter, search), [collateral, filter, search]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = visibleAssets.find((item) => item.id === selectedId) || visibleAssets[0] || null;
  const companyName = brand?.companyName || brand?.company_name || 'EMBLEM';
  const brandKey = String(brand?.brandId || brand?.id || brand?._id || companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  const colors = { ...DEFAULT_COLORS, ...(brand?.colors || {}) };
  colors.surface = brand?.colors?.surface || brand?.colors?.background || DEFAULT_COLORS.surface;
  const accentOnSurface = readableTextColor(colors.accent, colors.surface, colors.primary);
  const secondaryOnSurface = readableTextColor(colors.secondary, colors.surface, colors.primary);

  useEffect(() => {
    assetRailRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [filter, search]);

  useEffect(() => {
    try {
      const savedTemplate = window.localStorage.getItem(`emblem-business-card-template:${brandKey}`);
      const validTemplate = BUSINESS_CARD_TEMPLATES.some((template) => template.id === savedTemplate) ? savedTemplate : '';
      setAppliedTemplateId(validTemplate);
      setSelectedTemplateId(validTemplate || BUSINESS_CARD_TEMPLATES[0].id);
    } catch (error) {
      setAppliedTemplateId('');
      setSelectedTemplateId(BUSINESS_CARD_TEMPLATES[0].id);
    }
  }, [brandKey]);

  const slideAssets = (direction) => {
    const rail = assetRailRef.current;
    if (rail) rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.78), behavior: 'smooth' });
  };

  const openTemplateExplorer = () => {
    setSelectedTemplateId(appliedTemplateId || BUSINESS_CARD_TEMPLATES[0].id);
    setTemplateView('browse');
  };

  const applyBusinessCardTemplate = (templateId) => {
    setAppliedTemplateId(templateId);
    setSelectedTemplateId(templateId);
    setSide('both');
    try { window.localStorage.setItem(`emblem-business-card-template:${brandKey}`, templateId); } catch (error) { /* In-memory selection still works when storage is unavailable. */ }
    setTemplateView(null);
  };

  const updateColor = (key, value) => updateBrandTokens({ paletteId: '', colors: { ...(brand.colors || DEFAULT_COLORS), [key]: value } });
  const saveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSaveError('');
    try {
      await saveBrandProfile({
        companyName,
        tagline: brand?.tagline || '',
        colors: { primary: colors.primary, secondary: colors.secondary, accent: colors.accent, surface: colors.surface },
        paletteId: brand?.paletteId || ''
      });
      setIsEditing(false);
    } catch (error) {
      setProfileSaveError(error.message || 'Could not save brand changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };
  const copySpecs = async () => {
    if (!selected) return;
    const specs = `${selected.name}\nBrand: ${companyName}\nFormat: ${selected.format}\nDimensions: ${selected.dimensions}px\nBleed: ${selected.metadata?.bleed || '—'}\nResolution: ${selected.metadata?.resolution || '—'}`;
    try {
      await navigator.clipboard.writeText(specs);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
    }
  };

  const copyEmailSignature = async () => {
    const email = 'name@yourdomain.com';
    const website = 'yourdomain.com';
    const html = `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:${colors.primary};border-left:4px solid ${colors.accent};"><tr><td style="padding:12px 18px;"><strong style="font-size:16px;">Your name</strong><br><span style="font-size:12px;color:${secondaryOnSurface};">Your title</span><br><a href="mailto:${email}" style="font-size:12px;color:${colors.primary};text-decoration:none;">${email}</a><br><a href="https://${website}" style="font-size:12px;color:${accentOnSurface};text-decoration:none;">${website}</a><br><span style="font-size:10px;color:#817679;">Replace with your contact details</span></td><td style="padding:12px 18px;border-left:1px solid #e8e2df;"><strong style="font-size:12px;letter-spacing:1px;">${escapeXml(companyName)}</strong><br><span style="font-size:11px;color:#817679;">${escapeXml(brand?.tagline || '')}</span></td></tr></table>`;
    const plain = `Your name | Your title\n${email}\n${website}\nReplace with your contact details\n${companyName} · ${brand?.tagline || ''}`;
    try {
      if (navigator.clipboard?.write && window.ClipboardItem) {
        await navigator.clipboard.write([new window.ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' })
        })]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
    }
  };

  if (!collateral.length) return <div className="mx-auto max-w-6xl p-5 sm:p-8"><EmptyAssets onCreate={onCreate} /></div>;

  return <>
  <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
    <div className="mb-6 flex flex-col gap-4 border-b border-[#eadfd9] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.accent }} /><span className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#987c82]">Studio / Applied identity</span></div>
        <h1 className="text-3xl font-semibold tracking-[-.04em] text-[#302729] sm:text-4xl" style={{ fontFamily: brand?.typography?.display?.family }}>{companyName} <span className="font-normal text-[#a08f91]">Studio</span></h1>
        <p className="mt-1 max-w-2xl text-sm text-[#75696b]">Preview and refine touchpoints generated from your brand system.</p>
      </div>
    </div>

    {!visibleAssets.length ? <div className="border-y border-dashed border-[#d9c9c7] py-10 text-center text-sm text-[#85787a]">No assets match that search. Try another name or filter.</div> : <div className="space-y-7">
      <section className="border-y border-[#eadfd9] py-4 sm:py-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a08f91]">Made for your brand</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[#302729]">Collateral library <span className="ml-1 align-middle font-mono text-xs font-medium text-[#a08f91]">{visibleAssets.length}</span></h2><p className="mt-1 text-sm text-[#75696b]">Choose an asset to see the full preview and its details.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex w-fit gap-1 rounded-full border border-[#eadfd9] bg-[#f4eeeb] p-1">{FILTERS.map((entry) => <button type="button" key={entry} onClick={() => { setFilter(entry); setSelectedId(null); }} aria-pressed={filter === entry} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${filter === entry ? 'bg-white text-[#6b2438] shadow-sm' : 'text-[#85787a] hover:text-[#49383c]'}`}>{entry}</button>)}</div>
            <label className="relative block w-full sm:w-56"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08f91]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(null); }} placeholder="Find an asset" className="w-full rounded-xl border border-[#eadfd9] bg-[#fffdfb] py-2 pl-9 pr-3 text-xs text-[#302729] outline-none transition focus:border-[#bd8995]" /></label>
            <div className="flex items-center justify-end gap-1"><button type="button" onClick={() => slideAssets(-1)} aria-label="Scroll assets left" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd9] text-[#75696b] transition hover:bg-white"><ChevronLeft size={16} /></button><button type="button" onClick={() => slideAssets(1)} aria-label="Scroll assets right" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd9] text-[#75696b] transition hover:bg-white"><ChevronRight size={16} /></button></div>
          </div>
        </div>
        <div ref={assetRailRef} role="group" aria-label="Collateral assets" className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {visibleAssets.map((item) => <button type="button" aria-pressed={selected?.id === item.id} key={item.id} onClick={() => { setSelectedId(item.id); setSide('both'); }} className={`group w-[82%] shrink-0 snap-start border-l-2 px-3 py-1 text-left transition-all sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)] 2xl:w-[calc((100%-2.25rem)/4)] ${selected?.id === item.id ? 'border-l-[#8f4859] bg-[#f7edef]' : 'border-l-transparent hover:bg-white/70'}`}>
            <span className="relative mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-[#f1e9e5] p-2 sm:h-28">
              <span className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#d7c7c5 0.7px,transparent 0.7px)', backgroundSize: '14px 14px' }} />
              <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(makeCollateralSvg(brand, item, 'front'))}`} alt="" className="relative h-full w-full object-contain drop-shadow-sm" />
              {selected?.id === item.id && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#6b2438] text-white"><Check size={12} /></span>}
            </span>
            <span className="block truncate px-1 text-xs font-semibold text-[#302729]">{item.name}</span><span className="mt-1 flex items-center justify-between gap-1 px-1 font-mono text-[9px] uppercase tracking-wider text-[#a08f91]"><span className="truncate">{item.format}</span><span>{item.category}</span></span>
          </button>)}
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0 overflow-hidden rounded-[26px] border border-[#eadfd9] bg-[#fffdfb]">
        <div className="flex flex-col gap-3 border-b border-[#f0e8e5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0"><p className="font-mono text-[9px] font-bold uppercase tracking-[.2em] text-[#a08f91]">Your selection</p><h2 className="truncate text-xl font-semibold text-[#302729]">{selected.name}</h2><p className="mt-0.5 text-xs text-[#75696b]">A live preview using your current brand identity.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            {selected.type === 'business_card' && <button type="button" onClick={openTemplateExplorer} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#6b2438] px-3 text-[10px] font-semibold text-white transition hover:bg-[#552031]"><Sparkles size={12}/>Explore more</button>}
            {selected.type === 'business_card' && <div className="flex rounded-full border border-[#eadfd9] bg-[#f4eeeb] p-0.5">{['both', 'front', 'back'].map((entry) => <button type="button" key={entry} onClick={() => setSide(entry)} aria-pressed={side === entry} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${side === entry ? 'bg-[#6b2438] text-white' : 'text-[#85787a]'}`}>{entry}</button>)}</div>}
            <span className="rounded-full border border-[#eadfd9] bg-[#f7edef] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#7b3448]"><Check size={11} className="mr-1 inline" />{selected.consistencyScore}% aligned</span>
            <button type="button" onClick={selected.type === 'email_signature' ? copyEmailSignature : copySpecs} className="inline-flex items-center gap-1.5 rounded-lg border border-[#eadfd9] px-2.5 py-1.5 text-[10px] font-semibold text-[#6b2438] transition hover:bg-[#f7edef]">{copied ? <Check size={12} /> : <FileImage size={12} />}{copied ? 'Copied' : selected.type === 'email_signature' ? 'Copy signature' : 'Copy specs'}</button>
          </div>
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#f7f1ed] p-5 sm:min-h-[480px] sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(#d7c7c5 0.8px,transparent 0.8px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 flex w-full items-center justify-center"><MotionConfig reducedMotion="user"><AssetArtwork key={`${selected.id}-${selected.type}`} brand={brand} item={selected} side={side} onSideChange={setSide} cardTemplateId={selected.type === 'business_card' ? appliedTemplateId : ''} /></MotionConfig></div>
          <div className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-wider text-[#a08f91]">{selected.dimensions}px · {selected.format}</div>
        </div>
        <div className="grid grid-cols-2 gap-0 border-t border-[#f0e8e5] sm:grid-cols-4">{[['Format', selected.format], ['Dimensions', `${selected.dimensions}px`], ['Bleed', selected.metadata?.bleed], ['Resolution', selected.metadata?.resolution]].map(([label, value]) => <div key={label} className="border-b border-r border-[#f0e8e5] px-4 py-3 last:border-r-0 sm:border-b-0"><p className="font-mono text-[9px] uppercase tracking-widest text-[#a08f91]">{label}</p><p className="mt-1 truncate text-xs font-semibold text-[#49383c]">{value || '—'}</p></div>)}</div>
      </section>

      <aside className="h-fit border-t border-[#eadfd9] pt-4 xl:sticky xl:top-24 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
        <div className="flex items-center justify-between border-b border-[#eadfd9] px-1 py-3"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#a08f91]">Identity controls</p><h2 className="text-sm font-semibold text-[#302729]">Brand tokens</h2></div><button type="button" className="rounded-lg p-1.5 text-[#a08f91] hover:bg-[#f4eeeb] xl:hidden" onClick={() => setIsEditing(!isEditing)} aria-label={isEditing ? 'Close brand token editor' : 'Open brand token editor'}>{isEditing ? <X size={15} /> : <ChevronDown size={15} />}</button></div>
        <div className={`${isEditing ? 'block' : 'hidden'} space-y-5 p-4 xl:block`}>
          <label className="block space-y-1.5"><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#85787a]">Brand name</span><input value={companyName} onChange={(event) => updateBrandTokens({ companyName: event.target.value, company_name: event.target.value })} className="w-full rounded-lg border border-[#eadfd9] bg-[#fffdfb] px-3 py-2 text-xs text-[#302729] outline-none focus:border-[#8f4859]" /></label>
          <label className="block space-y-1.5"><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#85787a]">Tagline</span><textarea rows={2} value={brand?.tagline || ''} onChange={(event) => updateBrandTokens({ tagline: event.target.value })} className="w-full resize-y rounded-lg border border-[#eadfd9] bg-[#fffdfb] px-3 py-2 text-xs leading-relaxed text-[#302729] outline-none focus:border-[#8f4859]" /></label>
          <div><p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-wider text-[#85787a]">Palette</p><div className="space-y-2">{[['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['surface', 'Surface']].map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-lg border border-[#f0e8e5] px-2.5 py-2"><span className="text-xs text-[#67565a]">{label}</span><span className="flex items-center gap-2"><input aria-label={`${label} color`} type="color" value={colors[key]} onChange={(event) => updateColor(key, event.target.value)} className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="w-16 text-right font-mono text-[10px] text-[#85787a]">{colors[key].toUpperCase()}</span></span></label>)}</div></div>
          <p className="rounded-xl bg-[#f7f1ed] p-3 text-[10px] leading-relaxed text-[#75696b]">Save these edits to the brand so they stay in previews and future downloads.</p>
          {profileSaveError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-[10px] leading-4 text-rose-800">{profileSaveError}</p>}
          <button type="button" onClick={saveProfile} disabled={isSavingProfile} className="w-full rounded-xl bg-[#6b2438] py-2.5 text-xs font-bold text-white transition hover:bg-[#531a2c] disabled:cursor-wait disabled:opacity-60">{isSavingProfile ? 'Saving brand…' : 'Save brand changes'}</button>
        </div>
      </aside>
      </div>
    </div>}
  </div>
  {templateView && <BusinessCardDesignExplorer brand={brand} view={templateView} setView={setTemplateView} selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} appliedTemplateId={appliedTemplateId} onClose={() => setTemplateView(null)} onConfirm={applyBusinessCardTemplate} />}
  </>;
}
