'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { TransactionRecord } from '@/types';

export default function TransactionHistory() {
  const { transactions } = useAppContext();

  // Group line items by Batch_ID (one combined transaction per checkout)
  const batches = useMemo(() => {
    const map = new Map<string, TransactionRecord[]>();
    for (const tx of transactions) {
      const existing = map.get(tx.Batch_ID) ?? [];
      existing.push(tx);
      map.set(tx.Batch_ID, existing);
    }
    return Array.from(map.entries()).map(([batchId, records]) => ({ batchId, records }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            margin: '0 auto 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="12" y2="17" />
          </svg>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>No transactions yet</div>
        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
          Completed checkouts in this session will appear here.
        </div>
      </div>
    );
  }

  const sessionTotal = transactions.reduce((sum, tx, idx, arr) => {
    // Only count each batch's grand total once
    const firstOfBatch = arr.findIndex((t) => t.Batch_ID === tx.Batch_ID) === idx;
    return firstOfBatch ? sum + tx.Grand_Total : sum;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        <StatCard label="Total Transactions" value={String(batches.length)} />
        <StatCard label="Line Items" value={String(transactions.length)} />
        <StatCard label="Session Value" value={`${transactions[0]?.Currency_Code ?? ''} ${sessionTotal.toFixed(2)}`} />
      </div>

      {/* Batches */}
      {batches.map(({ batchId, records }) => {
        const first = records[0];
        return (
          <div
            key={batchId}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {/* Batch header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    {first.VAC_Name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                    {first.Country_Name} &nbsp;·&nbsp; {first.Payment_Name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    {new Date(first.Transaction_Date).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A5F', marginTop: '2px' }}>
                    {first.Currency_Code} {first.Grand_Total.toFixed(2)}
                  </div>
                </div>
                <StatusBadge status={first.Transaction_Status} />
              </div>
            </div>

            {/* Line items table */}
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 90px 90px',
                  padding: '6px 20px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <div>Service</div>
                <div>Qty</div>
                <div>Unit Price</div>
                <div style={{ textAlign: 'right' }}>Total</div>
              </div>
              {records.map((r, idx) => (
                <div
                  key={r.Transaction_ID}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 60px 90px 90px',
                    padding: '10px 20px',
                    alignItems: 'center',
                    borderBottom: idx < records.length - 1 ? '1px solid #F8FAFC' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 500 }}>{r.Service_Name}</div>
                    <div style={{ fontSize: '10px', color: '#CBD5E1' }}>Txn ID: {r.Transaction_ID}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{r.Quantity}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {r.Currency_Symbol} {r.Unit_Price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A5F', textAlign: 'right' }}>
                    {r.Currency_Symbol} {r.Line_Total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionRecord['Transaction_Status'] }) {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    Completed: { bg: '#F0FDF4', text: '#166534', dot: '#16A34A' },
    Pending: { bg: '#FFFBEB', text: '#92400E', dot: '#D97706' },
    Failed: { bg: '#FEF2F2', text: '#991B1B', dot: '#DC2626' },
  };
  const c = colors[status] ?? colors.Completed;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '10px',
        fontWeight: 600,
        color: c.text,
        backgroundColor: c.bg,
        padding: '3px 9px',
        borderRadius: '20px',
      }}
    >
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: c.dot }} />
      {status}
    </span>
  );
}
