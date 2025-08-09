import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
export const CreatorEconomicsVisualizer = () => {
  const bookPrice = 1.00; // Fixed at $1.00
  const [expectedSales, setExpectedSales] = useState([1000]);
  const [selectedGenre, setSelectedGenre] = useState('fiction');
  const [usdcRate, setUsdcRate] = useState(1.00);
  const genres = [{
    id: 'fiction',
    name: 'Fiction',
    multiplier: 1.0
  }, {
    id: 'non-fiction',
    name: 'Non-Fiction',
    multiplier: 1.2
  }, {
    id: 'romance',
    name: 'Romance',
    multiplier: 1.1
  }, {
    id: 'mystery',
    name: 'Mystery',
    multiplier: 1.05
  }, {
    id: 'fantasy',
    name: 'Fantasy',
    multiplier: 1.15
  }, {
    id: 'biography',
    name: 'Biography',
    multiplier: 1.3
  }];
  const currentGenre = genres.find(g => g.id === selectedGenre) || genres[0];

  // Calculate earnings
  const grossRevenue = bookPrice * expectedSales[0] * currentGenre.multiplier;
  const traditionalEarnings = grossRevenue * 0.125; // 12.5% average
  const cryptoEarnings = grossRevenue * 0.9; // 90%
  const difference = cryptoEarnings - traditionalEarnings;

  // Mock USDC rate (in real implementation, this would be fetched from an API)
  useEffect(() => {
    const interval = setInterval(() => {
      setUsdcRate(0.999 + Math.random() * 0.002); // Simulate slight USDC fluctuation
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const scenarios = [{
    name: "New Author",
    sales: 500,
    description: "Starting your publishing journey"
  }, {
    name: "Steady Seller",
    sales: 2000,
    description: "Building a loyal readership"
  }, {
    name: "Bestseller",
    sales: 10000,
    description: "Achieving mainstream success"
  }];
  const applyScenario = (scenario: typeof scenarios[0]) => {
    setExpectedSales([scenario.sales]);
  };
  return <div className="py-20 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Calculate Your Crypto Advantage
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how much more you can earn with decentralized publishing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator Input */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Earnings Calculator</h3>
            </div>

            {/* Fixed Book Price */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-white font-medium">Book Price</label>
                <span className="text-green-400 font-bold">$1.00</span>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="text-center text-gray-300">
                  <span className="text-2xl font-bold text-green-400">$1.00</span>
                  <p className="text-sm mt-1">Fixed price for all books</p>
                </div>
              </div>
            </div>

            {/* Expected Sales */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-white font-medium">Expected Sales</label>
                <span className="text-blue-400 font-bold">{expectedSales[0].toLocaleString()}</span>
              </div>
              <Slider value={expectedSales} onValueChange={setExpectedSales} max={50000} min={100} step={100} className="w-full" />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>100</span>
                <span>50,000</span>
              </div>
            </div>

            {/* Genre Selection */}
            <div className="mb-8">
              <label className="text-white font-medium mb-4 block">Genre</label>
              <div className="grid grid-cols-2 gap-3">
                {genres.map(genre => <button key={genre.id} onClick={() => setSelectedGenre(genre.id)} className={`p-3 rounded-lg border transition-all duration-200 ${selectedGenre === genre.id ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'}`}>
                    {genre.name}
                  </button>)}
              </div>
            </div>

            {/* Quick Scenarios */}
            <div>
              <label className="text-white font-medium mb-4 block">Quick Scenarios</label>
              <div className="space-y-3">
                {scenarios.map((scenario, index) => <Button key={index} onClick={() => applyScenario(scenario)} variant="outline" className="w-full justify-start bg-gray-700/50 border-gray-600 hover:bg-gray-600/50">
                    <div className="text-left">
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-sm text-gray-400">{scenario.description}</div>
                    </div>
                  </Button>)}
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            {/* Earnings Comparison */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Your Earnings Comparison</h3>
              
              <div className="space-y-6">
                {/* Traditional Publishing */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-red-400 font-semibold">Traditional Publishing</span>
                    <span className="text-sm text-gray-400">12.5% avg</span>
                  </div>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {formatCurrency(traditionalEarnings)}
                  </div>
                  <div className="text-sm text-gray-400">After publisher & distributor fees</div>
                </div>

                {/* Crypto Publishing */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-green-400 font-semibold">Crypto Publishing</span>
                    <span className="text-sm text-gray-400">90% kept</span>
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatCurrency(cryptoEarnings)}
                  </div>
                  <div className="text-sm text-gray-400">Instant USDC payments</div>
                </div>

                {/* Difference */}
                
              </div>
            </div>

            {/* Live Conversion Rate */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-semibold">Live USDC Rate</h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">1 USDC =</span>
                <span className="text-green-400 font-bold">${usdcRate.toFixed(4)}</span>
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Real-time conversion • Last updated: now
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};