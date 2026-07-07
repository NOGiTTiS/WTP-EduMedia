import type { Metadata } from 'next';
import { Sarabun, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const sarabun = Sarabun({
  variable: '--font-sarabun',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'wtp-edumedia | ระบบบริหารจัดการสื่อเทคโนโลยีสารสนเทศและแหล่งเรียนรู้',
  description: 'ระบบสารสนเทศคลังสื่อ นวัตกรรม และแหล่งเรียนรู้ สำหรับสถานศึกษา',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
