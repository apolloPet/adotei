
import { useState, useEffect } from 'react';
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import PartnershipSection from "@/components/home/PartnershipSection";
import PartnersSection from "@/components/home/PartnersSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import Footer from "@/components/home/Footer";

const Index = () => {
  // Intersection observer for animations
  const [isVisible, setIsVisible] = useState({
    howItWorks: false,
    benefits: false,
    partnership: false,
    partners: false,
    callToAction: false,
  });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = ['howItWorks', 'benefits', 'partnership', 'partners', 'callToAction'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <HowItWorksSection isVisible={isVisible.howItWorks} />
      <BenefitsSection isVisible={isVisible.benefits} />
      <PartnersSection isVisible={isVisible.partners} />
      <PartnershipSection isVisible={isVisible.partnership} />
      <CallToActionSection isVisible={isVisible.callToAction} />
      <Footer />
    </div>
  );
};

export default Index;
