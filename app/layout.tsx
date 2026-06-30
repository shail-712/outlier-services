import type { Metadata } from 'next';
import './globals.css';
import AppShell from './components/layout/AppShell';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Outlier Services — VFS',
  description: 'Value-Added Services Management for VFS Global',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
