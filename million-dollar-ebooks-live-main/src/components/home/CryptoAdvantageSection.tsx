import React, { useState } from 'react';
import { ArrowRight, Clock, Globe, DollarSign, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface CryptoAdvantageSectionProps {
  onGetStarted?: (userType: 'reader' | 'writer') => void;
}

export const CryptoAdvantageSection = ({ onGetStarted }: CryptoAdvantageSectionProps) => {
  const [activeComparison, setActiveComparison] = useState<'traditional' | 'crypto'>('traditional');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoinRevolution = () => {
    if (onGetStarted) {
      onGetStarted('writer');
    } else {
      // Fallback navigation if onGetStarted is not provided
      if (user) {
        navigate('/onboarding?type=writer');
      } else {
        navigate('/onboarding?type=writer');
      }
    }
  };

  const traditionalFeatures = [
    {
      icon: <DollarSign className="w-6 h-6 text-red-400" />,
      title: "10-15% Royalties",
      description: "Publishers keep 85-90% of your earnings",
      negative: true
    },
    {
      icon: <Clock className="w-6 h-6 text-red-400" />,
      title: "30-90 Day Payments",
      description: "Wait months to receive your earnings",
      negative: true
    },
    {
      icon: <Globe className="w-6 h-6 text-red-400" />,
      title: "Regional Restrictions",
      description: "Limited to specific geographic markets",
      negative: true
    },
    {
      icon: <Shield className="w-6 h-6 text-red-400" />,
      title: "Middleman Fees",
      description: "Multiple parties taking cuts from your work",
      negative: true
    }
  ];

  const cryptoFeatures = [
    {
      icon: <DollarSign className="w-6 h-6 text-green-400" />,
      title: "90% USDC Earnings",
      description: "Keep 90% of every sale in stable cryptocurrency",
      negative: false
    },
    {
      icon: <Zap className="w-6 h-6 text-green-400" />,
      title: "<2 Minute Payouts",
      description: "Instant payments directly to your wallet",
      negative: false
    },
    {
      icon: <Globe className="w-6 h-6 text-green-400" />,
      title: "Global Accessibility",
      description: "Sell anywhere in the world without restrictions",
      negative: false
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: "Zero Chargebacks",
      description: "Blockchain-verified payments, no reversals",
      negative: false
    }
  ];

  return (
    <div className="py-20 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            The Publishing Revolution
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Why creators are choosing decentralized publishing over traditional platforms
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 rounded-xl p-2 flex">
            <button
              onClick={() => setActiveComparison('traditional')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeComparison === 'traditional'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Traditional Publishing
            </button>
            <button
              onClick={() => setActiveComparison('crypto')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeComparison === 'crypto'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Crypto Publishing
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          {activeComparison === 'traditional' && (
            <div className="animate-fade-in">
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-red-400">Traditional Publishing</h3>
                </div>
                <div className="space-y-6">
                  {traditionalFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                        <p className="text-gray-300 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeComparison === 'crypto' && (
            <div className="animate-fade-in">
              <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-green-400">Crypto Publishing</h3>
                </div>
                <div className="space-y-6">
                  {cryptoFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                        <p className="text-gray-300 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            How Crypto Payments Work
          </h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="text-white font-medium">Reader Purchases</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <span className="text-white font-medium">Smart Contract</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <span className="text-white font-medium">Instant Payout</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleJoinRevolution}
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl font-semibold rounded-lg"
          >
            Join the Revolution
            <TrendingUp className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
