import { Country, Region, Currency, VAC, Service, PaymentMode, TransactionRecord } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getCountries: () => apiFetch<Country[]>('/api/countries'),
  getRegions: () => apiFetch<Region[]>('/api/regions'),
  getCurrencies: () => apiFetch<Currency[]>('/api/currencies'),

  getVACs: (countryCode?: string) =>
    apiFetch<VAC[]>(`/api/vacs${countryCode ? `?country=${encodeURIComponent(countryCode)}` : ''}`),

  getServices: (countryCode?: string) =>
    apiFetch<Service[]>(`/api/services${countryCode ? `?country=${encodeURIComponent(countryCode)}` : ''}`),

  getPaymentModes: (currencyCode?: string) =>
    apiFetch<PaymentMode[]>(`/api/payment-modes${currencyCode ? `?currency=${encodeURIComponent(currencyCode)}` : ''}`),

  createTransaction: (payload: {
    VAC_Code: string;
    Country_Code: string;
    Payment_Code: string;
    Currency_Code: string;
    line_items: { Service_Code: string; Quantity: number }[];
  }) =>
    apiFetch<TransactionRecord[]>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTransaction: (id: string | number) => apiFetch<TransactionRecord[]>(`/api/transactions/${id}`),
};