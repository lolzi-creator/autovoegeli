import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Dashboard - Auto Vögeli",
  description: "Manage your vehicle listings, view analytics, and optimize SEO performance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


