
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Zap, Users, Book, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CryptoTransaction {
  id: string;
  amount_usdc_cents: number;
  author_earnings_cents: number;
  created_at: string;
  book_title?: string;
  author_name?: string;
}

interface PlatformStats {
  totalEarnings: number;
  totalBooks: number;
  totalAuthors: number;
  totalSales: number;
}

export const CryptoActivityFeed = () => {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalEarnings: 0,
    totalBooks: 0,
    totalAuthors: 0,
    totalSales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCryptoActivity();
    fetchPlatformStats();
    
    // Set up real-time updates
    const channel = supabase
      .channel('crypto-activity')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'crypto_transactions'
      }, () => {
        fetchCryptoActivity();
        fetchPlatformStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCryptoActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select(`
          id,
          amount_usdc_cents,
          author_earnings_cents,
          created_at,
          books(title),
          profiles(display_name)
        `)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedData = data?.map(tx => ({
        id: tx.id,
        amount_usdc_cents: tx.amount_usdc_cents,
        author_earnings_cents: tx.author_earnings_cents,
        created_at: tx.created_at,
        book_title: tx.books?.title,
        author_name: tx.profiles?.display_name
      })) || [];

      setTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching crypto activity:', error);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const [earningsResult, booksResult, authorsResult, salesResult] = await Promise.all([
        supabase
          .from('crypto_transactions')
          .select('author_earnings_cents')
          .eq('payment_status', 'completed'),
        supabase
          .from('books')
          .select('id', { count: 'exact' })
          .eq('book_status', 'published'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('user_role', 'writer'),
        supabase
          .from('crypto_transactions')
          .select('id', { count: 'exact' })
          .eq('payment_status', 'completed')
      ]);

      const totalEarnings = earningsResult.data?.reduce((sum, tx) => sum + tx.author_earnings_cents, 0) || 0;
      
      setStats({
        totalEarnings,
        totalBooks: booksResult.count || 0,
        totalAuthors: authorsResult.count || 0,
        totalSales: salesResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUSDC = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Zap className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Live Platform Activity</h2>
          <p className="text-gray-400 text-sm">Real-time crypto transactions & earnings</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">${formatUSDC(stats.totalEarnings)}</div>
          <div className="text-xs text-gray-400">Author Earnings</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
          <Book className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">{stats.totalBooks}</div>
          <div className="text-xs text-gray-400">Published Books</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">{stats.totalAuthors}</div>
          <div className="text-xs text-gray-400">Active Authors</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-400">{stats.totalSales}</div>
          <div className="text-xs text-gray-400">Total Sales</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Crypto Sales</h3>
          <Badge variant="outline" className="text-green-400 border-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Live
          </Badge>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No crypto transactions yet</p>
            <p className="text-sm">Be the first to buy a book with USDC!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {tx.book_title || 'Book Purchase'}
                    </div>
                    <div className="text-sm text-gray-400">
                      Author earned ${formatUSDC(tx.author_earnings_cents)} USDC
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">
                    ${formatUSDC(tx.amount_usdc_cents)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getTimeAgo(tx.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
