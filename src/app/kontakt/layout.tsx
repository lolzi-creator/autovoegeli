import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kontakt - Auto Vögeli | Beratung & Service in der Schweiz",
  description: "Kontaktieren Sie Auto Vögeli für professionelle Beratung zu Premium-Fahrzeugen. Probefahrt vereinbaren, Finanzierung besprechen oder Service-Termin buchen. Ihr Autohaus in der Schweiz.",
  keywords: "Auto Vögeli Kontakt, Autohaus Schweiz Kontakt, Probefahrt vereinbaren, Finanzierung Beratung, Service Termin, Motorrad Beratung, Auto kaufen Schweiz",
  openGraph: {
    title: "Kontakt - Auto Vögeli | Ihr Partner für Premium-Fahrzeuge",
    description: "Kontaktieren Sie uns für professionelle Beratung, Probefahrten und Service. Ihr vertrauensvoller Autohaus-Partner in der Schweiz.",
    type: "website",
    url: "https://autovoegeli.ch/kontakt",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Auto Vögeli Kontakt - Ihr Autohaus in der Schweiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontakt - Auto Vögeli",
    description: "Kontaktieren Sie uns für professionelle Beratung und Service in der Schweiz.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://autovoegeli.ch/kontakt",
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
