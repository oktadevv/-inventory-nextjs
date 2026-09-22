import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RR Store Inventory",
  description: "Sistem Manajemen Inventaris & Stok",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.theme==='dark'||(!localStorage.theme&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
