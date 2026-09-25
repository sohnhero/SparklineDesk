import type { Metadata, Viewport } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';

export const metadata: Metadata = {
  title: 'Sparkline Desk — Documents & Finance',
  description: 'Application interne de génération et de suivi des documents commerciaux de Sparkline.',
  icons: {
    icon: '/assets/sparkline-symbol.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0b0c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
        <ToastContainer 
          position="bottom-right"
          theme="dark"
          toastStyle={{
            backgroundColor: 'rgba(15, 15, 17, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(39, 39, 42, 0.8)',
            color: '#fff',
            borderRadius: '12px',
          }}
        />
      </body>
    </html>
  );
}
