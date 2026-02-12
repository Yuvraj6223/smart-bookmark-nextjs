import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Bookmarks — Real-time Bookmark Manager",
  description:
    "A real-time bookmark management application with Google OAuth authentication, private user data isolation, and live synchronization across sessions.",
  keywords: ["bookmarks", "bookmark manager", "real-time", "google oauth", "supabase"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ToastProvider>
          <div className="bg-gradient-mesh" aria-hidden="true" />
          <Header />
          <main style={{ minHeight: "calc(100vh - 128px)" }}>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
