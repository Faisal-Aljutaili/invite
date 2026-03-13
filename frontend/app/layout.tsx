import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InviteApp',
  description: 'Manage and send event invitations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
