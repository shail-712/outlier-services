'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { PaymentMode } from '@/types';
import { api } from '@/lib/api';

export default function PaymentSelector() {
  const { selectedCurrency, selectedPayment, setSelectedPayment, cart } = useAppContext();

  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCurrency) {
      setPaymentModes([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .getPaymentModes(selectedCurrency.Currency_Code)
      .then((data) => !cancelled && setPaymentModes(data))
      .catch((err) => console.error('Failed to load payment modes:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [selectedCurrency]);

  if (!selectedCurrency) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '20px',
        }}
      >
        <SectionHeader />
        <div
          style={{
            marginTop: '12px',
            padding: '20px',
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '5px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>
            Select a country to load payment options.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        overflow: 'hidden',
        opacity: cart.length === 0 ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Header */}
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
          <SectionHeader />
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            {loading
              ? 'Loading payment modes...'
              : `${paymentModes.length} mode${paymentModes.length !== 1 ? 's' : ''} available for ${selectedCurrency.Currency_Code}`}
          </div>
        </div>
        {cart.length === 0 && (
          <span style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic' }}>
            Add services first
          </span>
        )}
      </div>

      {/* Payment mode options */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {paymentModes.map((mode) => {
          const isSelected = selectedPayment?.Payment_Code === mode.Payment_Code;
          return (
            <label
              key={mode.Payment_Code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                border: `1px solid ${isSelected ? '#1E3A5F' : '#E2E8F0'}`,
                borderRadius: '5px',
                backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <input
                type="radio"
                name="payment_mode"
                value={mode.Payment_Code}
                checked={isSelected}
                disabled={cart.length === 0}
                onChange={() => setSelectedPayment(mode)}
                style={{ accentColor: '#1E3A5F', width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 400, color: '#0F172A' }}>
                  {mode.Payment_Name}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
                  {mode.Payment_Code}
                </div>
              </div>
              {isSelected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Payment Mode</div>
  );
}