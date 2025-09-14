
import React from 'react';
import { DollarSign, Zap, TrendingUp } from 'lucide-react';

export const SimplifiedCryptoFeatures = () => {
  return (
    <div className="py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Authors Choose Crypto Publishing
          </h2>
          <p className="text-xl text-gray-400">
            Instant payments, global reach, and maximum earnings for creators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
            <div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">90% Revenue Share</h3>
            <p className="text-gray-300">Keep 90% of every sale in USDC cryptocurrency</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">Instant Payouts</h3>
            <p className="text-gray-300">Get paid immediately after each sale, no waiting</p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
            <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Global Reach</h3>
            <p className="text-gray-300">Sell to readers worldwide with crypto payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};
