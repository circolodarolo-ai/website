import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Bella Tavola | Autentica Cucina Italiana dal 1985",
  description: "Ristorante La Bella Tavola - Autentica cucina italiana nel cuore di Milano. Prenota il tuo tavolo, scopri il nostro menu e gli eventi speciali.",
  keywords: ["ristorante", "cucina italiana", "Milano", "La Bella Tavola", "prenotazione", "menu"],
  openGraph: {
    title: "La Bella Tavola | Autentica Cucina Italiana",
    description: "Tradizione, passione e sapori genuini nel cuore di Milano",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}