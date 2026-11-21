import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
jest.mock('../context/BrandContext', () => ({ useBrand: () => ({}) }));
import { BusinessCardDesignExplorer } from './BrandCollateral';

const brand = {
  companyName: 'Fieldnote',
  tagline: 'Make room to grow.',
  industry: 'Home gardening',
  logoStyleToken: 'organic',
  colors: { primary: '#284139', secondary: '#809076', accent: '#BB6830', surface: '#F8D794' },
  typography: { display: { family: 'Manrope' } },
  assets: [{ type: 'business_card', svgOrConfig: { back: { name: 'Riley Chen', title: 'Founder', email: 'riley@fieldnote.example', phone: '+1 555 0100', website: 'fieldnote.example', social: '@fieldnote' } } }]
};

function ExplorerHarness() {
  const [view, setView] = useState('browse');
  const [selectedTemplateId, setSelectedTemplateId] = useState('minimalist');
  const [appliedTemplateId, setAppliedTemplateId] = useState('');
  return <>
    <span data-testid="applied-template">{appliedTemplateId || 'none'}</span>
    {view && <BusinessCardDesignExplorer
      brand={brand}
      view={view}
      setView={setView}
      selectedTemplateId={selectedTemplateId}
      setSelectedTemplateId={setSelectedTemplateId}
      appliedTemplateId={appliedTemplateId}
      onClose={() => setView(null)}
      onConfirm={(templateId) => { setAppliedTemplateId(templateId); setView(null); }}
    />}
  </>;
}

describe('business card design explorer', () => {
  it('shows six separate horizontal template choices and does not apply on selection', () => {
    render(<ExplorerHarness />);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('6 templates')).toBeInTheDocument();
    ['Minimalist', 'Modern', 'Elegant', 'Bold', 'Geometric', 'Creative'].forEach((name) => {
      expect(within(dialog).getByRole('button', { name: `Preview ${name} business card design` })).toBeInTheDocument();
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Preview Creative business card design' }));
    expect(within(dialog).getByRole('heading', { name: 'Creative' })).toBeInTheDocument();
    expect(screen.getByTestId('applied-template')).toHaveTextContent('none');
    expect(within(dialog).getByRole('button', { name: 'both' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'front' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'back' })).toBeInTheDocument();
  });

  it('returns to designs without applying, then applies only on confirmation', async () => {
    render(<ExplorerHarness />);
    let dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Preview Modern business card design' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back to designs' }));
    expect(within(dialog).getByText('6 templates')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Preview Modern business card design' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm design' }));
    expect(screen.getByTestId('applied-template')).toHaveTextContent('modern');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
