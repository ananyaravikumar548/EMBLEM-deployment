import React, { useEffect, useState } from 'react';
import { BrandProvider, useBrand } from './context/BrandContext';
import { Create } from './pages/Create';
import { Generating } from './pages/Generating';
import { BrandGuidelines } from './components/brand/BrandGuidelines';
import { BrandDNA } from './pages/BrandDNA';
import { LogoSuite } from './pages/LogoSuite';
import { BrandSwitcher } from './components/brand/BrandSwitcher';
import BrandCollateral from './pages/BrandCollateral';
import { AuthPage } from './components/auth/AuthPage';
import { BrandHistory } from './pages/BrandHistory';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Dna, Layers3, LogOut, Menu, Plus, Sparkles, SwatchBook, X } from 'lucide-react';

const navigation = [
  { id: 'DNA', label: 'Brand DNA', mobileLabel: 'DNA', description: 'Strategy and tokens', icon: <Dna size={17} strokeWidth={1.8} /> },
  { id: 'STUDIO', label: 'Brand studio', mobileLabel: 'Studio', description: 'Applied identity', icon: <Layers3 size={17} strokeWidth={1.8} /> },
  { id: 'LOGO', label: 'Logo system', mobileLabel: 'Logo', description: 'Marks and lockups', icon: <Sparkles size={17} strokeWidth={1.8} /> },
  { id: 'ASSETS', label: 'Guidelines', mobileLabel: 'Guide', description: 'Rules and exports', icon: <BookOpen size={17} strokeWidth={1.8} /> },
  { id: 'HISTORY', label: 'Brand history', mobileLabel: 'History', description: 'Saved identities', icon: <Clock3 size={17} strokeWidth={1.8} /> },
];

const HeroLanding = ({ onStartCreate, onExploreDemo }) => {
  return (
    <div className="studio-landing">
      <section id="top" className="studio-hero relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-14 lg:pt-24">
        <div className="pointer-events-none absolute -right-36 top-10 h-[520px] w-[520px] rounded-full border border-[#6b2438]/[.06]" />
        <div className="pointer-events-none absolute -right-20 top-24 h-[390px] w-[390px] rounded-full border border-[#6b2438]/[.07]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.88fr_1.12fr] lg:gap-12">
          <div className="studio-hero-copy relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#eadfd9] bg-[#fffdfb]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#806e72]"><span className="h-1.5 w-1.5 rounded-full bg-[#9e3d58]" />Meet your new brand workspace</div>
            <h1 className="max-w-2xl text-[clamp(3.2rem,7vw,6.3rem)] font-semibold leading-[.97] tracking-[-.075em] text-[#302729]">Build a brand that <span className="studio-serif font-normal italic tracking-[-.06em] text-[#8f4859]">means business.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#75696b] sm:text-lg sm:leading-8">EMBLEM turns your big idea into a complete, consistent brand identity — from the thinking behind it to the assets you can put to work.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onStartCreate} className="group inline-flex items-center gap-3 rounded-full bg-[#6b2438] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-16px_rgba(107,36,56,.65)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#531a2c]">Create your brand <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></button>
              <button type="button" onClick={onExploreDemo} className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-[#6d5c60] transition hover:bg-white/80 hover:text-[#6b2438]">Explore the workspace <ArrowUpRight size={15} /></button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#eadfd9] pt-5 text-xs font-medium text-[#85787a]"><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#8f4859]" />From strategy to assets</span><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#8f4859]" />Made to stay consistent</span></div>
          </div>

          <div className="studio-preview relative mx-auto w-full max-w-[650px] lg:justify-self-end" aria-label="EMBLEM brand workspace preview">
            <div className="studio-preview-glow" />
            <div className="studio-preview-board relative overflow-hidden rounded-[24px] border border-white bg-[#fffdfb] p-3 shadow-[0_34px_90px_-48px_rgba(82,39,52,.42)] sm:rounded-[30px] sm:p-4">
              <div className="flex items-center justify-between border-b border-[#f0e8e4] px-2 pb-3 pt-1 sm:px-3"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#6b2438] text-[10px] font-bold text-white">E</span><span className="text-[11px] font-bold tracking-[.12em] text-[#49383c]">EMBLEM</span><span className="hidden text-[#d2c5c2] sm:inline">/</span><span className="hidden text-[10px] text-[#948588] sm:inline">Brand workspace</span></div><span className="rounded-full bg-[#f5eeeb] px-2.5 py-1 text-[9px] font-semibold text-[#7f6d70]">Example preview</span></div>
              <div className="grid min-h-[355px] sm:grid-cols-[150px_1fr]">
                <div className="hidden border-r border-[#f0e8e4] py-5 pr-3 sm:block"><p className="px-2 text-[8px] font-bold uppercase tracking-[.16em] text-[#b1a2a1]">Your workspace</p>{[['▦','Brand studio'],['✳','Logo system'],['◈','Brand DNA'],['≡','Guidelines']].map(([icon,label],i)=><div key={label} className={`mt-2 flex items-center gap-2 rounded-lg px-2 py-2 text-[9px] font-semibold ${i===0?'bg-[#f5e9eb] text-[#6b2438]':'text-[#948588]'}`}><span>{icon}</span>{label}</div>)}<div className="mt-8 rounded-xl bg-[#f8f3ef] p-3"><span className="text-[8px] font-bold uppercase tracking-[.12em] text-[#a08f91]">Brand health</span><div className="mt-2 flex items-end gap-1"><strong className="text-2xl leading-none text-[#49383c]">—</strong></div><p className="mt-2 text-[8px] leading-4 text-[#8c7b7e]">Score appears after generation</p></div></div>
                <div className="min-w-0 p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#a08f91]">Brand identity · overview</p><h2 className="mt-2 text-xl font-semibold tracking-[-.05em] text-[#302729] sm:text-2xl">Your brand, in one place.</h2></div><button type="button" onClick={onStartCreate} className="rounded-lg bg-[#6b2438] px-3 py-2 text-[9px] font-semibold text-white">New identity +</button></div>
                  <div className="mt-5 grid grid-cols-2 gap-3"><div className="relative min-h-[145px] overflow-hidden rounded-2xl bg-[#6b2438] p-4 text-white sm:min-h-[165px]"><div className="absolute -right-8 -top-9 h-36 w-36 rounded-full border border-white/15"/><div className="absolute -right-2 -top-3 h-24 w-24 rounded-full border border-white/15"/><span className="relative rounded-full border border-white/25 px-2 py-1 text-[8px] text-white/75">EXAMPLE MARK</span><div className="relative mt-8"><p className="studio-serif text-3xl italic">A</p><p className="mt-1 text-[8px] uppercase tracking-[.18em] text-white/65">Illustrative identity</p></div></div><div className="rounded-2xl bg-[#f4e9e5] p-4"><div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[.13em] text-[#947e80]"><span>Palette preview</span><span>5 swatches</span></div><div className="mt-5 flex h-12 overflow-hidden rounded-xl">{['#6B2438','#9E3D58','#C77B8F','#EBD9D5','#302729'].map(color=><span key={color} className="flex-1" style={{backgroundColor:color}} />)}</div><p className="mt-3 text-[9px] text-[#8d7b7e]">Example colors only</p></div></div>
                  <div className="mt-3 grid grid-cols-3 gap-2"><div className="col-span-2 rounded-xl border border-[#f0e8e4] p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-bold uppercase tracking-[.13em] text-[#a08f91]">Example assets</span><span className="text-[8px] font-semibold text-[#8f4859]">Preview only</span></div><div className="mt-3 flex gap-2"><div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-[#f7f1ed] text-[8px] font-bold tracking-[.1em] text-[#6b2438]">LOGO</div><div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-[#e6d6cf] text-[8px] font-bold tracking-[.1em] text-[#49383c]">SOCIAL</div></div></div><div className="flex flex-col justify-between rounded-xl bg-[#f8f3ef] p-3"><span className="text-[8px] font-bold uppercase tracking-[.13em] text-[#a08f91]">Export status</span><strong className="text-2xl leading-none text-[#49383c]">—</strong><span className="text-[8px] text-[#8d7b7e]">Available in workspace</span></div></div>
                </div>
              </div>
            </div>
            <div className="studio-preview-caption mt-3 flex items-center justify-between px-2 text-[10px] text-[#948588]"><span>Your whole identity, thoughtfully organized</span><span className="hidden sm:inline">EMBLEM / WORKSPACE</span></div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 border-y border-[#eadfd9] bg-[#fffdfb] px-5 py-16 sm:px-8 sm:py-20 lg:px-14">
        <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8f4859]">One connected toolkit</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-[#302729] sm:text-4xl">Everything your brand needs to show up.</h2><p className="mt-4 text-sm leading-7 text-[#75696b] sm:text-base">Go from first idea to a brand people recognize. Each part of EMBLEM is designed to work together, so your identity stays cohesive as it grows.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
            {icon:<Dna size={19}/>,step:'01',title:'Find your brand DNA',copy:'Shape your positioning, personality, audience, and visual direction into a clear foundation.'},
            {icon:<Sparkles size={19}/>,step:'02',title:'Build your logo system',copy:'Explore a distinctive mark and useful lockups that feel at home across every format.'},
            {icon:<SwatchBook size={19}/>,step:'03',title:'Create real-world assets',copy:'Apply your identity to stationery, social content, and the touchpoints your business needs.'},
            {icon:<BookOpen size={19}/>,step:'04',title:'Keep everything aligned',copy:'Bring your colors, type, and usage rules together in guidelines ready to share and export.'},
          ].map(item=><article key={item.step} className="group rounded-2xl border border-[#eee4df] bg-[#fffdfb] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#d8bdc2] hover:shadow-[0_18px_36px_-28px_rgba(82,39,52,.3)] sm:p-6"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e9eb] text-[#6b2438]">{item.icon}</span><span className="text-[10px] font-bold tracking-[.14em] text-[#b5a3a3]">{item.step}</span></div><h3 className="mt-6 text-base font-semibold tracking-[-.02em] text-[#49383c]">{item.title}</h3><p className="mt-2 text-xs leading-6 text-[#85787a]">{item.copy}</p></article>)}</div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-14"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8f4859]">A clear path forward</p><h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-.055em] text-[#302729] sm:text-4xl">From rough idea to ready-to-use identity.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-[#75696b]">Start with what makes your business different. EMBLEM helps turn it into a practical system you can use, refine, and share.</p><button type="button" onClick={onStartCreate} className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#6b2438]">Start building <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></div><div className="grid gap-3 sm:grid-cols-3">{[
            {n:'01',title:'Tell us your idea',text:'Add the essentials about your business and who you want to reach.'},
            {n:'02',title:'Shape your identity',text:'Explore your strategy, visual language, and the pieces that bring them to life.'},
            {n:'03',title:'Put it to work',text:'Review your guidelines, refine your assets, and export your brand kit.'},
          ].map((item,i)=><div key={item.n} className="relative rounded-2xl border border-[#eadfd9] bg-[#fffdfb] p-5 sm:min-h-[200px]"><span className="studio-serif text-3xl italic text-[#c18794]">{item.n}</span>{i<2&&<span className="absolute right-5 top-9 hidden h-px w-8 bg-[#dec9cc] sm:block"/>}<h3 className="mt-5 text-sm font-semibold text-[#49383c]">{item.title}</h3><p className="mt-2 text-xs leading-6 text-[#85787a]">{item.text}</p></div>)}</div></div></section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-14"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[28px] bg-[#572132] px-6 py-9 text-white sm:flex-row sm:items-center sm:px-10 sm:py-11"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/60">Make it unmistakably yours</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-.05em] sm:text-3xl">Your next chapter deserves a better brand.</h2></div><button type="button" onClick={onStartCreate} className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#572132] transition hover:bg-[#f4e9e5]">Create with EMBLEM <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></button></div></section>

      <footer className="border-t border-[#eadfd9] bg-[#fffdfb] px-5 py-8 sm:px-8 lg:px-14"><div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><a href="#top" className="inline-flex items-center gap-2.5 text-[#382a2d]" aria-label="EMBLEM home"><span className="flex h-7 w-7 rotate-45 items-center justify-center rounded-[8px] bg-[#6b2438]"><span className="h-2 w-2 rounded-sm bg-white"/></span><span className="text-[12px] font-extrabold tracking-[.14em]">EMBLEM</span></a><p className="mt-2 text-xs text-[#948588]">A home for your whole brand identity.</p></div><nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#75696b]"><a className="hover:text-[#6b2438]" href="#features">Features</a><a className="hover:text-[#6b2438]" href="#how-it-works">How it works</a><button className="hover:text-[#6b2438]" type="button" onClick={onStartCreate}>Get started</button></nav><p className="text-[10px] text-[#a08f91]">© {new Date().getFullYear()} EMBLEM Studio</p></div></footer>
    </div>
  );
};

const MainLayout = () => {
  const { brand, user, userBrands, selectBrand, isGenerating, loadDemo, exportKit, isExporting, logout } = useBrand();
  const [activeNav, setActiveNav] = useState('HERO');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authReturnNav, setAuthReturnNav] = useState('HERO');

  const activeItem = navigation.find((item) => item.id === activeNav);
  const isWorkspace = ['DNA', 'STUDIO', 'LOGO', 'ASSETS'].includes(activeNav);
  const isWorkspaceArea = isWorkspace || activeNav === 'HISTORY';

  const openAuth = (returnTo = 'HERO') => {
    setAuthReturnNav(returnTo === 'AUTH' ? 'HERO' : returnTo);
    setActiveNav('AUTH');
    setIsMenuOpen(false);
  };

  const navigate = (id) => {
    setActiveNav(id);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeNav]);

  const openSavedBrand = async (brandId) => {
    await selectBrand(brandId);
    setIsMenuOpen(false);
    setActiveNav('DNA');
  };

  // Handle automatic transition from Generating -> Workspace DNA View
  const handleGeneratingComplete = () => {
    setActiveNav('DNA');
  };

  return (
    <div className="studio-root min-h-screen w-full bg-[#faf7f4] text-[#302729] flex flex-col font-sans">

      {/* Global bar: brand context and a small set of useful actions. */}
      <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-[#e9dfda] bg-[#fffdfb]/95 px-4 shadow-[0_4px_20px_-20px_rgba(48,39,41,.45)] backdrop-blur-xl sm:px-7 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <button type="button" onClick={() => setActiveNav('HERO')} className="group flex shrink-0 items-center gap-3 rounded-lg text-left" aria-label="EMBLEM home">
            <span className="relative flex h-8 w-8 rotate-45 items-center justify-center rounded-[9px] bg-[#6b2438] shadow-[0_6px_14px_-8px_rgba(107,36,56,.85)] transition-transform group-hover:rotate-[55deg]"><span className="h-2.5 w-2.5 rounded-[2px] bg-white" /></span>
            <span className="text-[14px] font-extrabold tracking-[.14em] text-[#382a2d]">EMBLEM</span>
          </button>
          {isWorkspaceArea && <span className="hidden h-8 w-px bg-[#e9dfda] sm:block" />}
          {isWorkspaceArea && <div className="hidden min-w-0 sm:block"><BrandSwitcher onNewBrand={() => user ? setActiveNav('CREATE') : openAuth('CREATE')} /></div>}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {activeNav === 'HERO' && <nav aria-label="Main navigation" className="mr-3 hidden items-center gap-7 sm:flex"><a href="#features" className="text-[11px] font-semibold text-[#75696b] transition hover:text-[#6b2438]">Features</a><a href="#how-it-works" className="text-[11px] font-semibold text-[#75696b] transition hover:text-[#6b2438]">How it works</a></nav>}
          {isWorkspace && (
            <button type="button" onClick={exportKit} disabled={isExporting} className="mr-1 hidden h-10 items-center gap-2 rounded-xl bg-[#6b2438] px-4 text-[11px] font-semibold text-white shadow-[0_8px_18px_-13px_rgba(107,36,56,.85)] transition hover:-translate-y-px hover:bg-[#552031] disabled:opacity-60 sm:inline-flex">
              <ArrowDownToLine size={14} />{isExporting ? 'Preparing…' : 'Export kit'}
            </button>
          )}
          {activeNav !== 'AUTH' && <button type="button" aria-label={`History, ${userBrands.length} saved brands`} aria-current={activeNav === 'HISTORY' ? 'page' : undefined} onClick={() => user ? setActiveNav('HISTORY') : openAuth('HISTORY')} className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-semibold transition sm:gap-2 sm:px-3 ${activeNav === 'HISTORY' ? 'bg-[#f5ebec] text-[#6b2438]' : 'text-[#75696b] hover:bg-[#f8f2ef] hover:text-[#6b2438]'}`}><Clock3 size={15} strokeWidth={1.8}/><span className="hidden sm:inline">History</span><span className="min-w-5 rounded-full bg-white px-1.5 py-0.5 text-center font-mono text-[9px] text-[#8b7479]">{userBrands.length}</span></button>}
          {user ? (
            <button type="button" onClick={logout} title={`Sign out ${user.name || 'of EMBLEM'}`} className="group inline-flex h-10 items-center gap-2 rounded-xl px-1.5 text-[#75696b] transition hover:bg-[#f8f2ef] sm:ml-1 sm:pl-2.5 sm:pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfd9] bg-[#f4ece8] text-[10px] font-bold uppercase text-[#6b2438]">{user.name ? user.name.charAt(0) : 'U'}</span>
              <span className="hidden text-[10px] font-semibold sm:inline">Sign out</span><LogOut size={13} className="hidden text-[#a08f91] group-hover:text-[#6b2438] sm:block" />
            </button>
          ) : (
            activeNav !== 'AUTH' && <button type="button" onClick={() => openAuth(activeNav === 'CREATE' ? 'CREATE' : activeNav)} className="inline-flex h-9 items-center rounded-xl border border-[#e5d8d5] px-3 text-[11px] font-semibold text-[#6b2438] transition hover:border-[#c9aeb3] hover:bg-[#fff9f8] sm:h-10 sm:px-4">Sign in</button>
          )}
          {activeNav === 'HERO' && <button type="button" onClick={() => user ? setActiveNav('CREATE') : openAuth('CREATE')} className="hidden h-10 rounded-xl bg-[#6b2438] px-4 text-[11px] font-semibold text-white shadow-[0_8px_18px_-13px_rgba(107,36,56,.85)] transition hover:-translate-y-px hover:bg-[#552031] sm:inline-flex sm:items-center">Get started</button>}
          <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={isMenuOpen} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd9] bg-white text-[#6b2438] transition hover:bg-[#f8f2ef] sm:hidden">{isMenuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex min-h-0">

        {/* LEFT SIDEBAR (Hidden on HERO and CREATE views) */}
        {isWorkspaceArea && !isGenerating && (
          <aside className="studio-sidebar sticky top-[72px] hidden h-[calc(100vh-72px)] w-[252px] shrink-0 flex-col justify-between border-r border-[#ece3de] bg-[#fcfaf8] px-4 py-5 xl:px-5 lg:flex">
            <div>
              <div className="mb-7 flex items-center gap-2 px-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8f4859]" />
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#9a8589]">Brand workspace</p>
              </div>

              <div className="mb-7 flex items-center gap-3 rounded-2xl border border-[#eee5e0] bg-white/80 p-3 shadow-[0_8px_24px_-22px_rgba(48,39,41,.35)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6b2438] text-sm font-semibold text-white shadow-[0_6px_16px_-10px_rgba(107,36,56,.8)]">
                  {(brand?.companyName || brand?.company_name || 'E').trim().charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold tracking-[-.01em] text-[#382a2d]">{brand?.companyName || brand?.company_name || 'Your identity'}</span>
                  <span className="mt-1 block truncate text-[10px] text-[#9a898b]">{brand?.industry || 'Brand project'}</span>
                </span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b58463]" title="Current identity" />
              </div>

              <nav aria-label="Brand workspace" className="space-y-6">
                {[
                  { label: 'Create', items: navigation.filter((item) => item.id !== 'HISTORY') },
                  { label: 'Library', items: navigation.filter((item) => item.id === 'HISTORY') },
                ].map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.17em] text-[#b09fa0]">{group.label}</p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = activeNav === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigate(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group relative flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-left transition-colors ${isActive
                              ? 'bg-[#f3e9e9] text-[#6b2438]'
                              : 'text-[#75696b] hover:bg-white hover:text-[#49383c]'
                              }`}
                          >
                            {isActive && <span className="absolute bottom-2.5 left-0 top-2.5 w-[2px] rounded-full bg-[#8f4859]" />}
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-white text-[#6b2438] shadow-[0_2px_8px_-6px_rgba(48,39,41,.35)]' : 'text-[#9d8d8f] group-hover:text-[#7b3448]'}`}>{item.icon}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[11px] font-semibold">{item.label}</span>
                              <span className={`mt-0.5 block truncate text-[9px] ${isActive ? 'text-[#8f6570]' : 'text-[#a08f91]'}`}>{item.description}</span>
                            </span>
                            {item.id === 'HISTORY' && userBrands.length > 0 && <span className="rounded-full bg-white px-2 py-1 font-mono text-[9px] text-[#8b7479]">{userBrands.length}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            <div className="border-t border-[#ece3de] pt-4">
              <button type="button" onClick={() => user ? navigate('CREATE') : openAuth('CREATE')} className="group flex h-11 w-full items-center justify-between rounded-xl bg-[#6b2438] px-3.5 text-xs font-semibold text-white shadow-[0_10px_22px_-16px_rgba(107,36,56,.75)] transition hover:-translate-y-px hover:bg-[#552031]">
                <span className="flex items-center gap-2.5"><Plus size={15} strokeWidth={2} />Create a new brand</span>
                <ArrowUpRight size={14} className="text-white/65 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <p className="mt-3 px-1 text-[9px] text-[#ad9c9e]">Your ideas, all in one place.</p>
            </div>
          </aside>
        )}

        {/* WORKSPACE VIEW CANVAS */}
        <main className={activeNav === 'HERO' || activeNav === 'AUTH' ? 'min-w-0 flex-1 bg-[#faf7f4]' : 'studio-grid min-w-0 flex-1 bg-[#faf7f4] pb-20 lg:pb-0'}>
          {isWorkspace && !isGenerating && (
          <div className="lg:hidden px-5 pt-5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a08f91]">Brand workspace</p>
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[#49383c]">{activeItem.label}</h2>
              </div>
              <button
                type="button"
                onClick={exportKit}
                className="rounded-full bg-[#6b2438] px-3 py-1.5 text-[10px] font-semibold text-white"
              >
                Export
              </button>
            </div>
          )}

          {/* View Render Logic */}
          {isGenerating && activeNav !== 'CREATE' ? (
            <Generating onComplete={handleGeneratingComplete} />
          ) : activeNav === 'HERO' ? (
            <HeroLanding
              onStartCreate={() => user ? setActiveNav('CREATE') : openAuth('CREATE')}
              onExploreDemo={() => { loadDemo(); setActiveNav('DNA'); }}
            />
          ) : activeNav === 'CREATE' ? (
            <Create onComplete={() => setActiveNav('DNA')} />
          ) : activeNav === 'AUTH' ? (
            <AuthPage onBack={() => setActiveNav('HERO')} onSuccess={() => setActiveNav(authReturnNav)} />
          ) : activeNav === 'STUDIO' ? (
            <BrandCollateral onCreate={() => user ? setActiveNav('CREATE') : openAuth('CREATE')} />
          ) : activeNav === 'LOGO' ? (
            <LogoSuite />
          ) : activeNav === 'DNA' ? (
            <BrandDNA />
          ) : activeNav === 'HISTORY' ? (
            <BrandHistory brands={userBrands} activeBrand={brand} onOpenBrand={openSavedBrand} onCreateBrand={() => user ? setActiveNav('CREATE') : openAuth('CREATE')} />
          ) : (
            <BrandGuidelines onEditBrand={() => setActiveNav('DNA')} />
          )}
        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {isWorkspaceArea && !isGenerating && (
        <nav aria-label="Mobile brand workspace navigation" className="lg:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-[#eadfd9] bg-[#fffdfb]/95 px-1.5 py-2 backdrop-blur-xl sm:px-2">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(item.id)}
              aria-current={activeNav === item.id ? 'page' : undefined}
              className={`min-h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition-colors sm:text-[10px] ${activeNav === item.id ? 'bg-[#f2e5e7] text-[#6b2438]' : 'text-[#948588]'
                }`}
            >
              <span className="flex items-center justify-center">{item.icon}</span>
              <span>{item.mobileLabel}</span>
            </button>
          ))}
        </nav>
      )}

      {/* MOBILE POP-OUT MENU */}
      {isMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[72px] z-40 max-h-[calc(100vh_-_72px)] overflow-y-auto overscroll-contain border-b border-[#eadfd9] bg-[#fffdfb] p-4 shadow-[0_20px_50px_-32px_rgba(48,39,41,.35)]">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a08f91]">Navigate</p>
          <div className="space-y-1 border-t border-[#f1e9e5] pt-2">
            <button type="button" onClick={() => user ? navigate('HISTORY') : openAuth('HISTORY')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#6b2438] hover:bg-[#f8f0ed]"><Clock3 size={16}/>View all brand history <span className="ml-auto rounded-full bg-[#f2e5e7] px-2 py-0.5 text-[10px]">{userBrands.length}</span></button>
            <button type="button" onClick={() => user ? navigate('CREATE') : openAuth('CREATE')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#6b2438] hover:bg-[#f8f0ed]"><Plus size={16} />Start a new identity</button>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a08f91]">Brand history · {userBrands.length}</p>
            {userBrands.length ? userBrands.map((savedBrand) => (
              <button key={savedBrand._id} type="button" onClick={() => openSavedBrand(savedBrand._id)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#75696b] hover:bg-[#f8f0ed]"><span className="truncate">{savedBrand.companyName}</span><span className="ml-3 text-[9px] uppercase tracking-wider text-[#a08f91]">{savedBrand.status || 'saved'}</span></button>
            )) : <p className="px-3 py-3 text-xs leading-relaxed text-[#85787a]">Your saved identities will appear here.</p>}
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <BrandProvider>
      <MainLayout />
    </BrandProvider>
  );
}
