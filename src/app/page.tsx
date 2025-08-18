import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BrandsStrip from '@/components/BrandsStrip';
import ServiceBenefits from '@/components/ServiceBenefits';
import VisitCta from '@/components/VisitCta';
import Testimonials from '@/components/Testimonials';
import SmallMapCta from '@/components/SmallMapCta';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <BrandsStrip />
        <ServiceBenefits />
        <VisitCta />
        <Testimonials />
        <SmallMapCta />
      </main>
      <Footer />
    </div>
  );
}
