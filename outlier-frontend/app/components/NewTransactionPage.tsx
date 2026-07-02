'use client';

import { useAppContext } from '@/context/AppContext';
import CountryVACSelector from './CountryVACSelector';
import ServicesList from './ServicesList';
import CartSummary from './CartSummary';
import PaymentSelector from './PaymentSelector';

export default function NewTransactionPage() {
  const { selectedCountry, selectedVAC, cart, selectedPayment, selectedCurrency } = useAppContext();

  // Derive active step for indicator
  const activeStep =
    !selectedCountry || !selectedVAC ? 1
    : cart.length === 0 ? 2
    : !selectedPayment ? 3
    : 4;

  const steps = [
    { step: 1, label: 'Country & VAC' },
    { step: 2, label: 'Services' },
    { step: 3, label: 'Payment' },
    { step: 4, label: 'Confirm' },
  ];

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
            New Transaction
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Create Service Transaction</h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            Select a country and VAC, add services to cart, then confirm payment.
          </p>
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#475569',
            backgroundColor: '#F1F5F9',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            fontWeight: 500,
          }}
        >
          {selectedCurrency
            ? `${selectedCurrency.Currency_Symbol} ${selectedCurrency.Currency_Code}`
            : 'Currency: INR (default)'}
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
        {steps.map((s, i, arr) => {
          const isActive = s.step === activeStep;
          const isDone = s.step < activeStep;
          return (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? '#10B981' : isActive ? '#1E3A5F' : '#E2E8F0',
                    color: isDone || isActive ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : s.step}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    color: isDone ? '#10B981' : isActive ? '#1E3A5F' : '#94A3B8',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    width: '32px',
                    height: '1px',
                    backgroundColor: s.step < activeStep ? '#10B981' : '#E2E8F0',
                    margin: '0 8px',
                    transition: 'background-color 0.2s',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CountryVACSelector />
          <ServicesList />
          <PaymentSelector />
        </div>

        {/* Right column */}
        <CartSummary />
      </div>
    </div>
  );
}
