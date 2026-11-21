import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Create } from './Create';

const mockCreateBrand = jest.fn();
jest.mock('../context/BrandContext', () => ({
  useBrand: () => ({ createBrand: mockCreateBrand })
}));

test('submits the selected personality trait with the brand brief', async () => {
  mockCreateBrand.mockResolvedValue({});
  render(<Create onComplete={jest.fn()} />);

  fireEvent.change(screen.getByPlaceholderText(/we build brutalist ai design tools/i), {
    target: { value: 'Compact indoor growing kits for apartment homes.' }
  });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.change(screen.getByPlaceholderText(/fieldnote studio/i), { target: { value: 'Fieldnote' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /playful/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.change(screen.getByPlaceholderText(/generative ai, architecture, fintech/i), { target: { value: 'Home gardening' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  fireEvent.change(screen.getByPlaceholderText(/independent designers and small creative teams/i), { target: { value: 'City renters new to gardening.' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /create identity/i }));

  await waitFor(() => expect(mockCreateBrand).toHaveBeenCalledWith(expect.objectContaining({
    company_name: 'Fieldnote',
    personality: ['Playful'],
    industry: 'Home gardening',
    targetAudience: 'City renters new to gardening.'
  })));
});
