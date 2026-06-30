'use client';

import { TransactionRecord } from '@/types';

interface CheckoutModalProps {
  records: TransactionRecord[];
  onClose: () => void;
}

export default function CheckoutModal({ records, onClose }: CheckoutModalProps) {
  if (records.length === 0) return null;

  const first = records[0];
  const grandTotal = first.Grand_Total;
  const symbol = first.Currency_Symbol;
  const currencyCode = first.Currency_Code;
  const transactionDate = new Date(first.Transaction_Date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Modal panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Success header */}
        <div
          style={{
            backgroundColor: '#F0FDF4',
            borderBottom: '1px solid #BBF7D0',
            padding: '24px 24px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#064E3B' }}>Transaction Complete</div>
          <div style={{ fontSize: '12px', color: '#065F46', marginTop: '4px' }}>{transactionDate}</div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* VAC + payment summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <InfoCell label="VAC" value={first.VAC_Name} />
            <InfoCell label="Country" value={first.Country_Name} />
            <InfoCell label="Payment Mode" value={first.Payment_Name} />
            <InfoCell label="Batch ID" value={first.Batch_ID.replace('BATCH-', 'TXN-')} mono />
          </div>

          {/* Line items */}
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 50px 70px 80px',
                padding: '7px 12px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              {['Service', 'Qty', 'Price', 'Total'].map((h) => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {h}
                </div>
              ))}
            </div>

            {records.map((r, idx) => (
              <div
                key={r.Transaction_ID}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 50px 70px 80px',
                  padding: '9px 12px',
                  borderBottom: idx < records.length - 1 ? '1px solid #F1F5F9' : 'none',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>{r.Service_Name}</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>ID: {r.Transaction_ID}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{r.Quantity}</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{symbol} {r.Unit_Price.toFixed(2)}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A5F' }}>{symbol} {r.Line_Total.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Grand total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '5px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Grand Total</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F' }}>
              {currencyCode} {grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              New Transaction
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '5px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      style={{
        padding: '8px 10px',
        backgroundColor: '#F8FAFC',
        borderRadius: '4px',
        border: '1px solid #E2E8F0',
      }}
    >
      <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value}
      </div>
    </div>
  );
}
