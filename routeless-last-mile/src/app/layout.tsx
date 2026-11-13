import type { Metadata } from 'next';
import { AppProvider } from '../context/DemoContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ROUTELESS — RuralLink',
  description: 'Smart rural transport for students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
