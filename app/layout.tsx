import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Autonomous AI Creator Engine | Swiss Editorial HUD',
  description:
    'Unassisted neural social creator engine operating continuous background ingestion, pgvector deduplication, and LLM editorial gatekeeping.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-swiss-offwhite text-swiss-black antialiased selection:bg-y2k-cyan selection:text-swiss-black">
        {children}
      </body>
    </html>
  );
}
