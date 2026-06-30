'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Country, VAC, Currency } from '@/types';

import countriesData from '@/data/countries.json';
import vacsData from '@/data/vacs.json';
import currenciesData from '@/data/currencies.json';

const countries = countriesData as Country[];
const vacs = vacsData as VAC[];
const currencies = currenciesData as Currency[];

export default function CountryVACSelector() {
  const { selectedCountry, setSelectedCountry, selectedVAC, setSelectedVAC, setSelectedCurrency } = useAppContext();
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);

  const filteredCountries = useMemo(() =>
    countries.filter((c) =>
      c.Country_Name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.Country_Code.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countrySearch]);

  const filteredVACs = useMemo(() =>
    selectedCountry ? vacs.filter((v) => v.Country_Code === selectedCountry.Country_Code) : [],
    [selectedCountry]);

  const handleSelectCountry = (country: Country) => {
    const currency = currencies.find((c) => c.Currency_Code === country.Currency_Code) ?? null;
    setSelectedCountry(country);
    setSelectedCurrency(currency);
    setCountryOpen(false);
    setCountrySearch('');
  };

  const handleClearCountry = () => {
    setSelectedCountry(null);
    setSelectedCurrency(null);
    setCountrySearch('');
    setCountryOpen(false);
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        overflow: 'visible',
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Country &amp; VAC</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Select the country and application centre</div>
        </div>
        {selectedCountry && (
          <span
            style={{
              fontSize: '11px',
              background: '#DCFCE7',
              color: '#166534',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600,
            }}
          >
            Selected
          </span>
        )}
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Country selector */}
        <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Country
          </label>

          {/* Trigger */}
          <button
            onClick={() => setCountryOpen((o) => !o)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#FFFFFF',
              border: `1px solid ${countryOpen ? '#1E3A5F' : '#CBD5E1'}`,
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '13px',
              color: selectedCountry ? '#0F172A' : '#94A3B8',
              textAlign: 'left',
              outline: 'none',
            }}
          >
            <span>
              {selectedCountry
                ? `${selectedCountry.Country_Name} (${selectedCountry.Country_Code})`
                : 'Select country...'}
            </span>
            <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {selectedCountry && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleClearCountry(); }}
                  style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1, cursor: 'pointer', padding: '0 4px' }}
                  title="Clear"
                >
                  ×
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <polyline points={countryOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
              </svg>
            </span>
          </button>

          {/* Dropdown */}
          {countryOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '5px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                zIndex: 100,
                maxHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Search */}
              <div style={{ padding: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <input
                  autoFocus
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    outline: 'none',
                    color: '#0F172A',
                  }}
                />
              </div>
              {/* Options */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filteredCountries.length === 0 ? (
                  <div style={{ padding: '14px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>No countries found</div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.Country_Code}
                      onClick={() => handleSelectCountry(country)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: selectedCountry?.Country_Code === country.Country_Code ? '#EFF6FF' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: selectedCountry?.Country_Code === country.Country_Code ? '#1E3A5F' : '#334155',
                        fontWeight: selectedCountry?.Country_Code === country.Country_Code ? 600 : 400,
                        textAlign: 'left',
                      }}
                    >
                      <span>{country.Country_Name}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{country.Country_Code}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* VAC selector */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            VAC (Visa Application Centre)
          </label>
          <select
            value={selectedVAC?.VAC_Code ?? ''}
            onChange={(e) => {
              const vac = filteredVACs.find((v) => v.VAC_Code === e.target.value) ?? null;
              setSelectedVAC(vac);
            }}
            disabled={!selectedCountry}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #CBD5E1',
              borderRadius: '5px',
              fontSize: '13px',
              color: selectedVAC ? '#0F172A' : '#94A3B8',
              backgroundColor: selectedCountry ? '#FFFFFF' : '#F8FAFC',
              cursor: selectedCountry ? 'pointer' : 'not-allowed',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: 'auto',
              paddingRight: '32px',
            }}
          >
            <option value="">{selectedCountry ? 'Select VAC...' : 'Select a country first'}</option>
            {filteredVACs.map((vac) => (
              <option key={vac.VAC_Code} value={vac.VAC_Code}>
                {vac.VAC_Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info bar when both selected */}
      {selectedCountry && selectedVAC && (
        <div
          style={{
            margin: '0 20px 20px',
            padding: '10px 14px',
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: '#0369A1',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            <strong>{selectedVAC.VAC_Name}</strong> — {selectedCountry.Country_Name} &nbsp;|&nbsp; Currency: <strong>{selectedCountry.Currency_Code}</strong> &nbsp;|&nbsp; VAC Code: <strong>{selectedVAC.VAC_Code}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
