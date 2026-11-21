import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./lib/exportEngine', () => ({
  exportBrandKitZip: jest.fn()
}));

beforeEach(() => {
  global.fetch = jest.fn(async (url) => {
    if (String(url).endsWith('/auth/me')) return { ok: true, json: async () => ({ user: { id: 'test-user' } }) };
    if (String(url).endsWith('/brand')) return { ok: true, json: async () => ({ brands: [] }) };
    return { ok: false };
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the EMBLEM brand workspace', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /build a brand that means business/i })).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/brand$/), expect.any(Object)));
});

test('history shows all saved brands and can filter them', async () => {
  const brands = Array.from({ length: 9 }, (_, index) => ({
    _id: `brand-${index + 1}`,
    companyName: `Saved Brand ${index + 1}`,
    status: 'generated'
  }));
  global.fetch.mockImplementation(async (url) => {
    if (String(url).endsWith('/auth/me')) return { ok: true, json: async () => ({ user: { id: 'test-user' } }) };
    if (String(url).endsWith('/brand')) return { ok: true, json: async () => ({ brands }) };
    return { ok: false };
  });

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /explore the workspace/i }));
  const historyButton = await screen.findByRole('button', { name: 'History' });
  fireEvent.click(historyButton);

  expect(await screen.findByRole('button', { name: /Saved Brand 9/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Saved Brand 1/i })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox', { name: /search saved brands/i }), { target: { value: 'Brand 9' } });
  expect(screen.getByRole('button', { name: /Saved Brand 9/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Saved Brand 1/i })).not.toBeInTheDocument();
});
