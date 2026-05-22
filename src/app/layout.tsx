import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Memories by Hemant | Cinematic Wedding & Event Photography",
  description: "Premium cinematic wedding, event, and portrait photography by Hemant. Capturing timeless memories with a unique artistic vision.",
  keywords: ["wedding photography", "cinematography", "event photography", "prewedding shoot", "Memories by Hemant", "premium wedding films", "drone cinematography"],
  authors: [{ name: "Hemant" }],
  creator: "Hemant",
  publisher: "Memories by Hemant",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://memoriesbyhemant.com'),
  openGraph: {
    title: "Memories by Hemant | Cinematic Wedding & Event Photography",
    description: "Premium cinematic wedding, event, and portrait photography by Hemant.",
    url: "/",
    siteName: "Memories by Hemant",
    images: [
      {
        url: "/images/memories1.png",
        width: 1200,
        height: 630,
        alt: "Memories by Hemant Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memories by Hemant | Cinematic Photography",
    description: "Premium cinematic wedding, event, and portrait photography by Hemant.",
    images: ["/images/memories1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
