import TransactionHistory from '../components/TransactionHistory';

export default function HistoryPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Transaction History
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Past Transactions</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Session-only — completed checkouts are listed below, grouped by transaction batch.
        </p>
      </div>
      <TransactionHistory />
    </div>
  );
}
