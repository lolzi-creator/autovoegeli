import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Über uns - Auto Vögeli | Ihr vertrauensvoller Autohaus-Partner seit Jahren",
  description: "Lernen Sie Auto Vögeli kennen - Ihr vertrauensvoller Partner für Premium-Fahrzeuge in der Schweiz. Erfahrung, Qualität und erstklassiger Service seit Jahren. Entdecken Sie unsere Geschichte und Werte.",
  keywords: "Auto Vögeli über uns, Autohaus Geschichte, Premium Fahrzeuge Schweiz, Qualität Service, Vertrauen, Erfahrung, Motorrad Experten",
  openGraph: {
    title: "Über uns - Auto Vögeli | Ihr vertrauensvoller Partner",
    description: "Lernen Sie Auto Vögeli kennen - Ihr vertrauensvoller Partner für Premium-Fahrzeuge in der Schweiz seit Jahren.",
    type: "website",
    url: "https://autovoegeli.ch/ueber-uns",
    images: [
      {
        url: "/homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Auto Vögeli - Über uns, Ihr vertrauensvoller Autohaus-Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Über uns - Auto Vögeli",
    description: "Ihr vertrauensvoller Partner für Premium-Fahrzeuge in der Schweiz seit Jahren.",
    images: ["/homepage.jpg"],
  },
  alternates: {
    canonical: "https://autovoegeli.ch/ueber-uns",
  },
};

export default function UeberUnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
