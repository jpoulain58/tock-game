import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tock Game - Jeu de plateau en ligne",
  description: "Jouez au Tock en ligne avec vos amis ! Jeu de plateau 2v2 avec animations temps réel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('tock-theme-storage');
                  const theme = stored ? JSON.parse(stored).state.theme : 'light';
                  document.documentElement.classList.add(theme);
                  // Force style attribute for immediate visual feedback
                  if (theme === 'dark') {
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              margin: 0;
              padding: 0;
            }
            html.light, html.light body {
              background-color: #ffffff !important;
              color: #171717 !important;
            }
            html.dark, html.dark body {
              background-color: #0a0a0a !important;
              color: #ededed !important;
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors`}
      >
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
