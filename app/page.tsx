import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WorkflowSection from '@/components/landing/WorkflowSection';
import AboutSection from '@/components/landing/AboutSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';
import FilmGrain from '@/components/landing/FilmGrain';

export const metadata: Metadata = {
  title: 'CreatorFlow \u2014 Sistema Operacional para o Audiovisual',
  description:
    'Do briefing \u00e0 aprova\u00e7\u00e3o final do cliente. Gerencie equipe, or\u00e7amentos, roteiros e aprovações em um \u00fanico ecossistema premium para produtoras e creators.',
  keywords:
    'ERP audiovisual, gest\u00e3o de produ\u00e7\u00e3o, portal do cliente, or\u00e7amento audiovisual, freelancers, roteiro, storyboard, produtora',
  openGraph: {
    title: 'CreatorFlow \u2014 Sistema Operacional para o Audiovisual',
    description:
      'Do briefing \u00e0 aprova\u00e7\u00e3o final. Ecossistema premium para produtoras e creators.',
    url: 'https://creatorflowia.com',
    siteName: 'CreatorFlow',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <main className="bg-[#0A0A0A] text-white min-h-screen overflow-x-hidden">
      <FilmGrain />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <AboutSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
