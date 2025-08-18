import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auto Vögeli - Ihr Autohaus in der Schweiz",
  description: "Auto Vögeli - Qualitätsfahrzeuge, professioneller Service und faire Preise. Entdecken Sie unser Sortiment an Neu- und Gebrauchtwagen.",
  keywords: "Auto Vögeli, Autohaus, Schweiz, Gebrauchtwagen, Neuwagen, Autoverkauf, Autoservice",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Auto Vögeli - Ihr Autohaus in der Schweiz",
    description: "Qualitätsfahrzeuge, professioneller Service und faire Preise",
    type: "website",
    locale: "de_CH",
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
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
