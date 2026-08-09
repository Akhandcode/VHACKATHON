import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IMAGINATION — Autonomous AI Creator Engine | Swiss Editorial HUD',
  description:
    'IMAGINATION: Unassisted AI & Tech persona discovering live topics, exercising editorial judgment, preserving vector memory, and publishing continuous rationale-backed feed posts over 48 hours.',
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
