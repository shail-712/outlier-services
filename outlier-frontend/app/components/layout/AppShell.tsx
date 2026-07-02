'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <Sidebar open={sidebarOpen} />
      <main
        style={{
          marginTop: '56px',
          marginLeft: sidebarOpen ? '220px' : '0px',
          transition: 'margin-left 0.2s ease',
          padding: '24px',
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
