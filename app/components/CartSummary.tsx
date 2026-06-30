'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { TransactionRecord } from '@/types';
import CheckoutModal from './CheckoutModal';

export default function CartSummary() {
  const {
    cart,
    grandTotal,
    selectedCurrency,
    selectedCountry,
    selectedVAC,
    selectedPayment,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkout,
  } = useAppContext();

  const symbol = selectedCurrency?.Currency_Symbol ?? '₹';
  const currencyCode = selectedCurrency?.Currency_Code ?? 'INR';

  const [receipt, setReceipt] = useState<TransactionRecord[] | null>(null);

  const canCheckout = cart.length > 0 && selectedPayment !== null && selectedVAC !== null;

  const handleCheckout = () => {
    const records = checkout();
    if (records && records.length > 0) {
      setReceipt(records);
    }
  };

  return (
    <>
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'sticky',
        top: '76px',
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Cart Summary</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            {cart.length === 0 ? 'No items added' : `${cart.length} item${cart.length !== 1 ? 's' : ''} selected`}
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              fontSize: '11px',
              color: '#EF4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              fontWeight: 500,
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* VAC context */}
      {selectedVAC && (
        <div
          style={{
            padding: '8px 20px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #F1F5F9',
            fontSize: '11px',
            color: '#64748B',
          }}
        >
          <span style={{ fontWeight: 600 }}>{selectedVAC.VAC_Name}</span>
          {selectedCountry && (
            <span style={{ color: '#94A3B8' }}> — {selectedCountry.Country_Name}</span>
          )}
        </div>
      )}

      {/* Empty state */}
      {cart.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#F1F5F9',
              borderRadius: '50%',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>
            Use the + button next to a service to add it here.
          </div>
        </div>
      ) : (
        // Cart items
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cart.map((item) => (
            <div
              key={item.service.Service_Code}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                paddingBottom: '10px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              {/* Service name + code */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0F172A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.service.Service_Name}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                  {item.service.Service_Code}
                </div>

                {/* Mini stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '6px' }}>
                  <button
                    onClick={() => updateCartQuantity(item.service.Service_Code, item.quantity - 1)}
                    style={{
                      width: '22px',
                      height: '22px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '3px 0 0 3px',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <div
                    style={{
                      width: '28px',
                      height: '22px',
                      border: '1px solid #E2E8F0',
                      borderLeft: 'none',
                      borderRight: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#1E3A5F',
                      backgroundColor: '#EFF6FF',
                    }}
                  >
                    {item.quantity}
                  </div>
                  <button
                    onClick={() => updateCartQuantity(item.service.Service_Code, item.quantity + 1)}
                    style={{
                      width: '22px',
                      height: '22px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0 3px 3px 0',
                      backgroundColor: '#1E3A5F',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Line total + remove */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A5F' }}>
                  {symbol} {item.line_total.toFixed(2)}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
                  {symbol} {item.service.Unit_Price.toFixed(2)} × {item.quantity}
                </div>
                <button
                  onClick={() => removeFromCart(item.service.Service_Code)}
                  style={{
                    marginTop: '6px',
                    fontSize: '10px',
                    color: '#94A3B8',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grand total */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>GRAND TOTAL</div>
          {cart.length > 0 && (
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
              {cart.reduce((s, i) => s + i.quantity, 0)} unit{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E3A5F' }}>
          {currencyCode} {grandTotal.toFixed(2)}
        </div>
      </div>

      {/* Payment status hint */}
      {cart.length > 0 && !selectedPayment && (
        <div
          style={{
            padding: '8px 20px',
            backgroundColor: '#FFFBEB',
            borderTop: '1px solid #FDE68A',
            fontSize: '11px',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Select a payment mode below to proceed.
        </div>
      )}

      {/* Checkout button */}
      <div style={{ padding: '16px 20px' }}>
        <button
          onClick={handleCheckout}
          disabled={!canCheckout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: canCheckout ? '#1E3A5F' : '#E2E8F0',
            color: canCheckout ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '5px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: canCheckout ? 'pointer' : 'not-allowed',
            letterSpacing: '0.3px',
            transition: 'background-color 0.15s',
          }}
        >
          Confirm &amp; Checkout
        </button>
        {!canCheckout && cart.length > 0 && (
          <div style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginTop: '6px' }}>
            {!selectedPayment ? 'Choose a payment mode to enable checkout' : 'Select a VAC to proceed'}
          </div>
        )}
      </div>
    </div>

    {receipt && (
      <CheckoutModal records={receipt} onClose={() => setReceipt(null)} />
    )}
    </>
  );
}
