import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Watermark from '@/components/Watermark';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ImóveisApp - Plataforma para Corretores',
  description: 'Plataforma completa para corretores de imóveis publicarem e gerenciarem seus imóveis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Watermark />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f8fafc' },
          }}
        />
      </body>
    </html>
  );
}
