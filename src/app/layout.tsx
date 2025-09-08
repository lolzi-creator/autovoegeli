import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://autovoegeli.ch'),
  title: "Auto Vögeli - Ihr Autohaus in der Schweiz | Premium Fahrzeuge & Service",
  description: "Auto Vögeli - Ihr vertrauensvoller Partner für Premium-Fahrzeuge in der Schweiz. Geprüfte Neu- und Gebrauchtwagen, professionelle Beratung, faire Preise und erstklassiger Service. Jetzt Traumauto finden!",
  keywords: "Auto Vögeli, Autohaus Schweiz, Gebrauchtwagen, Neuwagen, Motorräder, Premium Fahrzeuge, Autoverkauf, Autoservice, Finanzierung, Probefahrt, YAMAHA, VOGE, BMW, ZONTES, SWM, KOVE, Motorrad Schweiz",
  authors: [{ name: "Auto Vögeli" }],
  creator: "Auto Vögeli",
  publisher: "Auto Vögeli",
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
  openGraph: {
    title: "Auto Vögeli - Ihr Autohaus in der Schweiz | Premium Fahrzeuge & Service",
    description: "Ihr vertrauensvoller Partner für Premium-Fahrzeuge in der Schweiz. Geprüfte Neu- und Gebrauchtwagen, professionelle Beratung und erstklassiger Service.",
    type: "website",
    locale: "de_CH",
    url: "https://autovoegeli.ch",
    siteName: "Auto Vögeli",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Auto Vögeli - Ihr Autohaus in der Schweiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Vögeli - Ihr Autohaus in der Schweiz",
    description: "Premium-Fahrzeuge, professionelle Beratung und erstklassiger Service in der Schweiz.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://autovoegeli.ch",
  },
  other: {
    "google-site-verification": "your-google-site-verification-code", // Replace with actual code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: {
                        50: '#f0f9f4',
                        100: '#dcf2e4',
                        200: '#bce5cc',
                        300: '#8dd2a8',
                        400: '#5ab87e',
                        500: '#8bc442',
                        600: '#72a035',
                        700: '#5c7f2c',
                        800: '#4d6626',
                        900: '#405322',
                      },
                      secondary: {
                        50: '#f8fafc',
                        100: '#f1f5f9',
                        200: '#e2e8f0',
                        300: '#cbd5e1',
                        400: '#94a3b8',
                        500: '#64748b',
                        600: '#475569',
                        700: '#334155',
                        800: '#1e293b',
                        900: '#0f172a',
                      },
                      accent: {
                        50: '#fef7ee',
                        100: '#fdedd7',
                        200: '#fad7ae',
                        300: '#f6ba7a',
                        400: '#f19444',
                        500: '#ed741e',
                        600: '#de5a14',
                        700: '#b84414',
                        800: '#923718',
                        900: '#762f16',
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <StructuredData type="organization" />
        <PerformanceOptimizer />
        {/* Google Analytics - disabled for now, using Vercel Analytics */}
        {/* <GoogleAnalytics measurementId="G-XXXXXXXXXX" /> */}
        <Analytics />
        <SpeedInsights />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
