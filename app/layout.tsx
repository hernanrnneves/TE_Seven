import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TRASP Seven | Control de Transporte',
  description: 'Plataforma de gestión de flota y remitos.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={clsx(inter.variable, "min-h-screen antialiased bg-background text-foreground selection:bg-white/10")}>
        <main className="relative flex flex-col min-h-screen overflow-hidden">
          {/* Background Gradients */}
          <div className="fixed inset-0 z-[-1]">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
