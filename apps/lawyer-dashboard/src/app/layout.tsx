import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NyayaOS Lawyer Dashboard',
  description: 'NyayaOS - The Agentic Operating System for the Justice Ecosystem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
