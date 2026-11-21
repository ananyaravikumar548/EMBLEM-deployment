import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Clock3, Plus, Search, Sparkles } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Saved brand';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved brand';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export function BrandHistory({ brands = [], activeBrand, onOpenBrand, onCreateBrand }) {
  const [query, setQuery] = useState('');
  const filteredBrands = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return brands;
    return brands.filter((brand) => [brand.companyName, brand.industry, brand.description, brand.targetAudience, brand.status]
      .some((field) => String(field || '').toLowerCase().includes(search)));
  }, [brands, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-7 sm:py-9 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-[#eadfd9] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#8f4859]"><Clock3 size={13}/>Your workspace archive</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] text-[#302729] sm:text-4xl">Brand history</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#85787a]">Return to an identity you’ve created and keep building from where you left off.</p>
        </div>
        <div className="flex items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-wider text-[#a08f91]">{brands.length} {brands.length === 1 ? 'identity' : 'identities'}</span><button type="button" onClick={onCreateBrand} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#6b2438] px-4 text-xs font-semibold text-white transition hover:bg-[#552031]"><Plus size={14}/>New brand</button></div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-[#49383c]">Saved identities</p><p className="mt-1 text-xs text-[#a08f91]">Showing every brand saved to this account.</p></div>
        <label className="relative block w-full sm:max-w-xs"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a08f91]"/><input aria-label="Search saved brands" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your brands" className="h-10 w-full rounded-full border border-[#eadfd9] bg-[#fffdfb] pl-10 pr-4 text-xs text-[#302729] outline-none transition placeholder:text-[#ad9fa0] focus:border-[#bd8995] focus:ring-4 focus:ring-[#8f4859]/[.06]"/></label>
      </div>

      {filteredBrands.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredBrands.map((savedBrand) => {
        const id = savedBrand._id || savedBrand.id;
        const isActive = String(activeBrand?._id || activeBrand?.id || '') === String(id);
        return <button key={id || savedBrand.companyName} type="button" onClick={() => onOpenBrand(id)} className={`group relative flex min-h-52 flex-col overflow-hidden rounded-[22px] border bg-[#fffdfb] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-32px_rgba(82,39,52,.45)] ${isActive ? 'border-[#b97988] shadow-[0_0_0_2px_rgba(143,72,89,.08)]' : 'border-[#eadfd9] hover:border-[#cfacb3]'}`}>
          <span className="absolute -right-8 -top-10 h-32 w-32 rounded-full border border-[#eadfd9] transition group-hover:border-[#d8bdc2]"/><span className="absolute -right-1 -top-3 h-20 w-20 rounded-full border border-[#f0e8e5]"/>
          <span className="relative flex w-full items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5e9eb] text-[#7b3448]"><Sparkles size={16}/></span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8f4f1] px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-[#927f82]"><span className="h-1 w-1 rounded-full bg-[#a4765d]"/>{savedBrand.status || 'saved'}</span></span>
          <span className="relative mt-6 block w-full"><span className="flex items-center gap-2"><span className="truncate text-lg font-semibold tracking-[-.03em] text-[#302729]">{savedBrand.companyName || 'Untitled identity'}</span>{isActive && <span className="shrink-0 rounded-full bg-[#f5e9eb] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#7b3448]">Open</span>}</span><span className="mt-1 block truncate text-xs text-[#8f4859]">{savedBrand.industry || 'Brand identity'}</span></span>
          <span className="relative mt-3 line-clamp-2 min-h-9 w-full text-xs leading-5 text-[#918184]">{savedBrand.description || savedBrand.targetAudience || 'Open this identity to continue refining its strategy and visual system.'}</span>
          <span className="relative mt-auto flex w-full items-center justify-between border-t border-[#f0e8e5] pt-4"><span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-[#a08f91]"><Clock3 size={12}/>{formatDate(savedBrand.updatedAt || savedBrand.createdAt)}</span><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6b2438]">Open identity <ArrowUpRight size={13}/></span></span>
        </button>;
      })}</div> : <section className="flex min-h-72 flex-col items-center justify-center border-y border-dashed border-[#dbc9c7] px-5 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e9eb] text-[#8f4859]"><Clock3 size={20}/></span>
        <h2 className="mt-4 text-lg font-semibold text-[#49383c]">{query ? 'No matching brands' : 'Your saved brands will appear here'}</h2>
        <p className="mt-2 max-w-md text-xs leading-5 text-[#918184]">{query ? 'Try a different name, industry, or audience.' : 'Create a brand while signed into this account and it will be saved here for your next visit.'}</p>
        {!query && <button type="button" onClick={onCreateBrand} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#e6d7d7] bg-white px-4 text-xs font-semibold text-[#6b2438] transition hover:bg-[#fbf6f5]"><Plus size={14}/>Create your first brand</button>}
      </section>}
    </div>
  );
}

export default BrandHistory;
