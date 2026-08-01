import './globals.css';

export const metadata = {
  title: 'Pulse — AI Lead Qualification CRM',
  description: 'AI-powered CRM that captures, qualifies, and prioritises leads for spend-management sales teams.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
