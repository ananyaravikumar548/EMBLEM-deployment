import React, { useState, useRef, useEffect } from 'react';
import { useBrand } from '../../context/BrandContext';
import { Check, ChevronDown, Plus, Sparkles } from 'lucide-react';

export const BrandSwitcher = ({ onNewBrand }) => {
  const { brand, userBrands, selectBrand } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentBrandName = brand?.companyName || brand?.company_name || 'Choose a brand';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Current brand: ${currentBrandName}. ${isOpen ? 'Close' : 'Switch'} brand`}
        className="flex max-w-[250px] items-center gap-2.5 rounded-xl border border-[#ece3de] bg-white px-2.5 py-1.5 text-left shadow-[0_4px_12px_-12px_rgba(48,39,41,.45)] transition hover:border-[#d9c5c5] hover:bg-[#fffaf8]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f3e9e9] text-[#713246]">
          <Sparkles size={14} strokeWidth={1.8}/>
        </span>
        <span className="min-w-0 flex-1 py-0.5">
          <span className="block text-[8px] font-bold uppercase tracking-[.14em] text-[#aa9699]">Current brand</span>
          <span className="mt-0.5 block max-w-[150px] truncate text-[11px] font-semibold text-[#49383c]">{currentBrandName}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 text-[#9a8589] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-[286px] overflow-hidden rounded-2xl border border-[#e9dfda] bg-[#fffdfb] text-xs shadow-[0_24px_60px_-30px_rgba(48,39,41,.32)]">
          <div className="flex items-center justify-between border-b border-[#f1e9e5] bg-[#fcf9f7] px-4 py-3">
            <span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#9d898d]">Switch identity</span>
            <span className="font-mono text-[9px] text-[#aa999b]">{userBrands.length} saved</span>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {userBrands.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5e9eb] text-[#7b3448]"><Sparkles size={14}/></span>
                <p className="mt-2 text-[10px] font-medium text-[#75696b]">{brand ? `Previewing ${currentBrandName}` : 'No saved brands yet'}</p>
                <p className="mt-1 text-[9px] text-[#a08f91]">Create a brand to keep it in your workspace.</p>
              </div>
            ) : (
              userBrands.map((b) => {
                const isSelected = String(brand?.id || brand?._id || '') === String(b._id);
                return (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => {
                      selectBrand(b._id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[#fbf6f3] ${
                      isSelected ? 'bg-[#f7eeee] font-semibold text-[#6b2438]' : 'text-[#75696b]'
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#eee5e0] bg-white text-[10px] font-semibold uppercase text-[#7b3448]">{(b.companyName || 'B').trim().charAt(0)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[11px]">{b.companyName || 'Untitled brand'}</span><span className="mt-0.5 block truncate text-[9px] font-normal text-[#a08f91]">{b.industry || b.status || 'Brand identity'}</span></span>
                    {isSelected ? <Check size={14} className="shrink-0 text-[#8f4859]"/> : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e6d8d4]"/>}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-[#f1e9e5] p-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNewBrand) onNewBrand();
              }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left font-semibold text-[#6b2438] hover:bg-[#f8f0ed]"
            >
              <Plus size={14} />
              <span>New brand</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
