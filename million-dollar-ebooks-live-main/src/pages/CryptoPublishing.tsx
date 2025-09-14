import { useEffect } from "react";
import { CryptoAdvantageSection } from "@/components/home/CryptoAdvantageSection";
import { StatsSection } from "@/components/home/StatsSection";
import { TechnologyStackSection } from "@/components/home/TechnologyStackSection";
import { CreatorEconomicsVisualizer } from "@/components/home/CreatorEconomicsVisualizer";
import { Header } from "@/components/layout/Header";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const CryptoPublishing = () => {
  const navigate = useNavigate();
  const { theme, forceTheme } = useTheme();

  // Force dark theme on this page
  useEffect(() => {
    const originalTheme = theme;
    forceTheme('dark');
    
    // Cleanup: restore original theme when leaving this page
    return () => {
      forceTheme(null);
    };
  }, [forceTheme]);

  const seoData = {
    title: "Why Choose Crypto Publishing - Revolutionary Decentralized Platform",
    description: "Discover why creators are choosing decentralized publishing. Earn 90% in USDC with instant payouts, zero chargebacks, and global accessibility.",
    url: "https://milliondollarebooks.com/crypto-publishing",
    type: "website" as const
  };

  const handleGetStarted = (userType: 'reader' | 'writer') => {
    if (userType === 'writer') {
      navigate('/onboarding?type=writer');
    } else {
      navigate('/discover');
    }
  };

  return (
    <>
      <SEOHead seo={seoData} />
      <div className="min-h-screen bg-black">
        <Header />
        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <div className="py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-black to-gray-900">
            <div className="container mx-auto max-w-4xl text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-8 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 to-green-400 bg-clip-text text-transparent">
                Why Choose Crypto Publishing?
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover the revolutionary advantages of decentralized publishing and why creators worldwide are making the switch to crypto-first platforms.
              </p>
            </div>
          </div>

          {/* All the detailed sections */}
          <CryptoAdvantageSection onGetStarted={handleGetStarted} />
          <StatsSection />
          <TechnologyStackSection />
          <CreatorEconomicsVisualizer />

          {/* Final CTA */}
          <div className="py-20 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-gray-900 to-black text-center">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Join the Revolution?
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => handleGetStarted('reader')} 
                  className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-xl font-semibold"
                >
                  Start Reading
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => handleGetStarted('writer')} 
                  className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl font-semibold"
                >
                  Start Earning 90% in USDC
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CryptoPublishing;
