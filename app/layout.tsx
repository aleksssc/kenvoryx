import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppearanceProvider } from "@/components/dashboard/appearance-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://sentinelgrid-one.vercel.app/";

export const metadata = {
  title: "Kenvoryx",
  description: "Infrastructure monitoring platform",

  openGraph: {
    title: "Kenvoryx",
    description: "Infrastructure monitoring platform",
    url: "https://sentinelgrid-one.vercel.app",
    siteName: "Kenvoryx",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kenvoryx",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Kenvoryx",
    description: "Infrastructure monitoring platform",
    images: ["/og-image.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
  <html
    lang="en"
    translate="no"
    suppressHydrationWarning
  >
    <head>
      <meta name="google" content="notranslate" />
    </head>

    <body className={`${geistSans.className} antialiased notranslate`}>
      <AppearanceProvider>
        {children}
      </AppearanceProvider>
    </body>
  </html>
);
}
