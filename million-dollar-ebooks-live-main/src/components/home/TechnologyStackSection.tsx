import React from 'react';
import { Shield, Zap, Globe, Code, Coins, Server } from 'lucide-react';
export const TechnologyStackSection = () => {
  const technologies = [{
    name: "Thirdweb Engine",
    description: "Decentralized smart contract infrastructure powering seamless Web3 interactions",
    icon: <Code className="w-8 h-8 text-blue-400" />,
    color: "blue",
    status: "Active"
  }, {
    name: "Polygon Network",
    description: "Low-cost, fast transactions on Ethereum's most popular scaling solution",
    icon: <Server className="w-8 h-8 text-purple-400" />,
    color: "purple",
    status: "Active"
  }, {
    name: "USDC Payments",
    description: "Stable cryptocurrency ensuring predictable earnings without volatility",
    icon: <Coins className="w-8 h-8 text-green-400" />,
    color: "green",
    status: "Active"
  }, {
    name: "Smart Contracts",
    description: "Automated, transparent royalty distribution with zero human intervention",
    icon: <Shield className="w-8 h-8 text-orange-400" />,
    color: "orange",
    status: "Active"
  }, {
    name: "Decentralized Storage",
    description: "Distributed content delivery ensuring permanent accessibility worldwide",
    icon: <Globe className="w-8 h-8 text-cyan-400" />,
    color: "cyan",
    status: "Active"
  }, {
    name: "Instant Settlements",
    description: "Real-time payment processing with sub-second confirmation times",
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    color: "yellow",
    status: "Active"
  }];
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
      purple: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
      green: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
      orange: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20",
      cyan: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20",
      yellow: "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };
  return <div className="py-20 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-black to-gray-900">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Built on Revolutionary Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The world's first publishing platform powered entirely by blockchain technology
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {technologies.map((tech, index) => <div key={index} className={`${getColorClasses(tech.color)} border rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  {tech.icon}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">{tech.status}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{tech.name}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{tech.description}</p>
            </div>)}
        </div>

        {/* Technical Stats */}
        <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Platform Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">&lt;2s</div>
              <div className="text-gray-300">Payment Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">Minimal</div>
              <div className="text-gray-300">Transaction Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-gray-300">Global Access</div>
            </div>
          </div>
        </div>

        {/* Partnership Badges */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-300 mb-8">
            Powered by Industry Leaders
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg">
              <span className="text-white font-semibold">Thirdweb</span>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg">
              <span className="text-white font-semibold">Polygon</span>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg">
              <span className="text-white font-semibold">Circle</span>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg">
              <span className="text-white font-semibold">USDC</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};