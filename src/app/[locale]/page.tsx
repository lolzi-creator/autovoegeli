import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ServiceBenefits from '@/components/ServiceBenefits';
import VisitCta from '@/components/VisitCta';
import SmallMapCta from '@/components/SmallMapCta';
import Footer from '@/components/Footer';
import PerformanceOptimizer from '@/components/PerformanceOptimizer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PerformanceOptimizer />
      <Header />
      <main className="flex-1">
        <Hero />
        {/* Removed heavy components for performance */}
        {/* <FeaturedGridServer locale="de" /> */}
        <ServiceBenefits />
        <VisitCta />
        <SmallMapCta />
        {/* <Testimonials /> */}
      </main>
      <Footer />
    </div>
  );
}
