import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppearanceProvider } from "@/components/dashboard/appearance-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://sentinelgrid-one.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "KenvoryX",
  description: "Monitor. Manage. Secure. — Infrastructure monitoring and endpoint management.",

  openGraph: {
    title: "KenvoryX",
    description: "Monitor. Manage. Secure. — Infrastructure monitoring and endpoint management.",
    url: defaultUrl,
    siteName: "KenvoryX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KenvoryX",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "KenvoryX",
    description: "Monitor. Manage. Secure. — Infrastructure monitoring and endpoint management.",
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
