import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Finanzierung - Auto Vögeli | Flexible Fahrzeugfinanzierung in der Schweiz",
  description: "Flexible Finanzierungslösungen für Ihr Traumfahrzeug bei Auto Vögeli. Attraktive Konditionen, schnelle Abwicklung und individuelle Beratung für Motorräder und Autos in der Schweiz.",
  keywords: "Auto Vögeli Finanzierung, Fahrzeugfinanzierung Schweiz, Motorrad Finanzierung, Auto Kredit, Leasing, Ratenkauf, günstige Zinsen Schweiz",
  openGraph: {
    title: "Finanzierung - Auto Vögeli | Flexible Fahrzeugfinanzierung",
    description: "Flexible Finanzierungslösungen für Ihr Traumfahrzeug. Attraktive Konditionen und individuelle Beratung in der Schweiz.",
    type: "website",
    url: "https://autovoegeli.ch/finanzierung",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Auto Vögeli Finanzierung - Flexible Lösungen für Ihr Fahrzeug",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finanzierung - Auto Vögeli",
    description: "Flexible Finanzierungslösungen für Ihr Traumfahrzeug in der Schweiz.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://autovoegeli.ch/finanzierung",
  },
};

export default function FinanzierungLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
