import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navigation from "@/components/ui/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Agri-Nexus | AI-Integrated Digital Twin Platform",
  description: "Real-time precision farming platform with AI-powered crop recommendations, weather simulation, and geo-intelligence analytics.",
  keywords: ["agriculture", "digital twin", "precision farming", "AI", "crop recommendations", "weather simulation"],
  authors: [{ name: "Agri-Nexus Team" }],
  openGraph: {
    title: "Agri-Nexus Digital Twin",
    description: "The Ultimate Precision Farming Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
        style={{
          backgroundColor: '#1a1c1a',
          backgroundImage: 'radial-gradient(at 0% 0%, hsla(153, 20%, 15%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(120, 15%, 12%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(153, 20%, 15%, 1) 0, transparent 50%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
