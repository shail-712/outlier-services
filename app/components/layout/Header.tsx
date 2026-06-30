'use client';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header
      style={{
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '16px',
        paddingRight: '24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        gap: '16px',
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0,
        }}
        aria-label="Toggle sidebar"
      >
        <span style={{ display: 'block', width: '18px', height: '2px', background: '#475569', borderRadius: '1px' }} />
        <span style={{ display: 'block', width: '18px', height: '2px', background: '#475569', borderRadius: '1px' }} />
        <span style={{ display: 'block', width: '18px', height: '2px', background: '#475569', borderRadius: '1px' }} />
      </button>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            background: '#1E3A5F',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>VFS</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', lineHeight: 1.2 }}>
            Outlier Services
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', letterSpacing: '0.3px', lineHeight: 1 }}>
            Value-Added Services Management
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right side info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '12px', color: '#64748B' }}>{today}</span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '16px',
            borderLeft: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D4ED8' }}>OP</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Operator</div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>Front Desk</div>
          </div>
        </div>
      </div>
    </header>
  );
}
