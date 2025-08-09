
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Star, TrendingUp, Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuthorStats {
  id: string;
  display_name: string;
  avatar_url: string | null;
  crypto_earnings_cents: number;
  book_count: number;
  total_sales: number;
  latest_book_title: string | null;
  join_date: string;
}

export const AuthorShowcase = () => {
  const [topAuthors, setTopAuthors] = useState<AuthorStats[]>([]);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorStats();
    fetchPendingApplications();
  }, []);

  const fetchAuthorStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          avatar_url,
          crypto_earnings_cents,
          created_at,
          books!inner(id, title, created_at)
        `)
        .eq('user_role', 'writer')
        .order('crypto_earnings_cents', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedData = data?.map(author => {
        const bookCount = author.books?.length || 0;
        const latestBook = author.books?.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return {
          id: author.id,
          display_name: author.display_name || 'Anonymous Author',
          avatar_url: author.avatar_url,
          crypto_earnings_cents: author.crypto_earnings_cents || 0,
          book_count: bookCount,
          total_sales: Math.floor((author.crypto_earnings_cents || 0) / 90), // Approximate sales from 90% cut
          latest_book_title: latestBook?.title || null,
          join_date: author.created_at
        };
      }) || [];

      setTopAuthors(formattedData);
    } catch (error) {
      console.error('Error fetching author stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApplications = async () => {
    try {
      const { count, error } = await supabase
        .from('author_applications')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (error) throw error;
      setPendingApplications(count || 0);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  };

  const formatUSDC = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getJoinedAgo = (date: string) => {
    const now = new Date();
    const joined = new Date(date);
    const diffInDays = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Award className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Top Crypto Authors</h2>
            <p className="text-gray-400 text-sm">Writers earning real money from their craft</p>
          </div>
        </div>
        
        {pendingApplications > 0 && (
          <Badge variant="outline" className="text-orange-400 border-orange-400">
            <Clock className="w-3 h-3 mr-1" />
            {pendingApplications} pending review
          </Badge>
        )}
      </div>

      {topAuthors.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No authors yet</p>
          <p className="text-sm">Be the first to join our crypto publishing platform!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topAuthors.map((author, index) => (
            <div key={author.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 relative">
              {index < 3 && (
                <Badge 
                  className={`absolute -top-2 -right-2 ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    'bg-orange-500 text-white'
                  }`}
                >
                  #{index + 1}
                </Badge>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {author.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{author.display_name}</div>
                  <div className="text-xs text-gray-400">Joined {getJoinedAgo(author.join_date)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Crypto Earnings</span>
                  <span className="font-bold text-green-400">
                    ${formatUSDC(author.crypto_earnings_cents)} USDC
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Books Published</span>
                  <span className="font-medium text-blue-400">{author.book_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Sales</span>
                  <span className="font-medium text-orange-400">{author.total_sales}</span>
                </div>

                {author.latest_book_title && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-500">Latest Book:</div>
                    <div className="text-sm text-white truncate">{author.latest_book_title}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-green-400">Why Authors Choose Us</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-gray-300">
            <div className="font-medium text-white">90% Revenue Share</div>
            <div>Keep 90% of every sale in USDC</div>
          </div>
          <div className="text-gray-300">
            <div className="font-medium text-white">Instant Payouts</div>
            <div>Get paid immediately after each sale</div>
          </div>
          <div className="text-gray-300">
            <div className="font-medium text-white">Global Reach</div>
            <div>Sell to readers worldwide with crypto</div>
          </div>
        </div>
      </div>
    </div>
  );
};
