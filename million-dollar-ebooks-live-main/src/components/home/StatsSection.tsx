
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Globe, Zap, Shield } from 'lucide-react';

interface PlatformStats {
  totalAuthors: number;
  totalEarnings: number;
  totalBooks: number;
  totalTransactions: number;
  averagePayoutTime: string;
  countriesReached: number;
  uptime: string;
}

export const StatsSection = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalAuthors: 0,
    totalEarnings: 0,
    totalBooks: 0,
    totalTransactions: 0,
    averagePayoutTime: "<2 min",
    countriesReached: 45,
    uptime: "99.9%"
  });

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const [authorsResult, earningsResult, booksResult, transactionsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('user_role', 'writer'),
        supabase.from('profiles').select('crypto_earnings_cents').eq('user_role', 'writer'),
        supabase.from('books').select('id', { count: 'exact' }).eq('book_status', 'published'),
        supabase.from('crypto_transactions').select('id', { count: 'exact' }).eq('payment_status', 'completed')
      ]);

      const totalEarnings = earningsResult.data?.reduce((sum, profile) => sum + (profile.crypto_earnings_cents || 0), 0) || 0;

      setStats({
        totalAuthors: authorsResult.count || 0,
        totalEarnings,
        totalBooks: booksResult.count || 0,
        totalTransactions: transactionsResult.count || 0,
        averagePayoutTime: "<2 min",
        countriesReached: 45,
        uptime: "99.9%"
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  };

  const formatUSDC = (cents: number) => {
    if (cents === 0) {
      return '$0';
    }
    if (cents >= 100000) {
      return `$${(cents / 100000).toFixed(0)}K+`;
    }
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatNumber = (num: number) => {
    if (num === 0) {
      return '0';
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getEarningsSubtitle = () => {
    return stats.totalEarnings === 0 ? 'Ready for first earnings' : 'Total Creator Earnings';
  };

  const getTransactionsSubtitle = () => {
    return stats.totalTransactions === 0 ? 'Platform ready for transactions' : 'Completed Transactions';
  };

  const getAuthorsSubtitle = () => {
    return stats.totalAuthors === 0 ? 'Ready for authors' : 'Active Authors';
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,107,107,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Creator Earnings */}
          <div className="text-center p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-colors">
            <div className="text-4xl font-bold text-red-400 mb-2">
              {formatUSDC(stats.totalEarnings)}
            </div>
            <div className="text-gray-300 text-sm">
              {getEarningsSubtitle()}
            </div>
          </div>

          {/* Blockchain Transactions */}
          <div className="text-center p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-colors">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {formatNumber(stats.totalTransactions)}
            </div>
            <div className="text-gray-300 text-sm">
              {getTransactionsSubtitle()}
            </div>
          </div>

          {/* Active Authors */}
          <div className="text-center p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-green-500/50 transition-colors">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {formatNumber(stats.totalAuthors)}
            </div>
            <div className="text-gray-300 text-sm">
              {getAuthorsSubtitle()}
            </div>
          </div>

          {/* Countries Reached */}
          <div className="text-center p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-colors">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {stats.countriesReached}+
            </div>
            <div className="text-gray-300 text-sm">
              Countries Reached
            </div>
          </div>
        </div>

        {/* Revolutionary Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-center space-x-4 p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
            <div className="p-3 rounded-full bg-red-500/20 text-red-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-white font-semibold">
                {stats.averagePayoutTime}
              </div>
              <div className="text-gray-400 text-sm">
                Average Payout Time
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="text-white font-semibold">
                Global Reach
              </div>
              <div className="text-gray-400 text-sm">
                Worldwide Access
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
            <div className="p-3 rounded-full bg-green-500/20 text-green-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="text-white font-semibold">
                {stats.uptime}
              </div>
              <div className="text-gray-400 text-sm">
                Platform Uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
