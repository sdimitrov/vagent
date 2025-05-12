import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Header from './components/Header';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SociAI Reels",
  description: "Automate your social media video creation and posting with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-slate-900 text-slate-200`}>
          <Header />
          <main className="pt-4 sm:pt-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
