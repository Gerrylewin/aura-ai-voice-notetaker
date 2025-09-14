
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, BookOpen, Gift, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FinancialMetrics {
  totalRevenue: number;
  platformFees: number;
  authorEarnings: number;
  totalPurchases: number;
  totalTips: number;
  totalGifts: number;
  recentTransactions: any[];
}

export function FinancialAnalytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['financial-analytics'],
    queryFn: async (): Promise<FinancialMetrics> => {
      // Fetch purchase data with correct column names
      const { data: purchases } = await supabase
        .from('purchases')
        .select('amount_cents, platform_fee_cents, author_earnings_cents, purchased_at, books(title), profiles(display_name)')
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: false })
        .limit(10);

      // Fetch tips data
      const { data: tips } = await supabase
        .from('tips')
        .select('amount_cents, platform_fee_cents, author_earnings_cents')
        .eq('payment_status', 'completed');

      // Fetch gifts data
      const { data: gifts } = await supabase
        .from('book_gifts')
        .select('id')
        .eq('status', 'claimed');

      const totalRevenue = (purchases || []).reduce((sum, p) => sum + (p.amount_cents || 0), 0) + 
                          (tips || []).reduce((sum, t) => sum + (t.amount_cents || 0), 0);
      
      const platformFees = (purchases || []).reduce((sum, p) => sum + (p.platform_fee_cents || 0), 0) + 
                          (tips || []).reduce((sum, t) => sum + (t.platform_fee_cents || 0), 0);
      
      const authorEarnings = (purchases || []).reduce((sum, p) => sum + (p.author_earnings_cents || 0), 0) + 
                            (tips || []).reduce((sum, t) => sum + (t.author_earnings_cents || 0), 0);

      return {
        totalRevenue,
        platformFees,
        authorEarnings,
        totalPurchases: purchases?.length || 0,
        totalTips: tips?.length || 0,
        totalGifts: gifts?.length || 0,
        recentTransactions: purchases || []
      };
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading financial data...</p>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(metrics?.platformFees || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Author Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics?.authorEarnings || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Book Sales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalPurchases || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tips Received</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalTips || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gifts Given</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalGifts || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics?.recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{transaction.books?.title || 'Unknown Book'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {transaction.profiles?.display_name || 'Unknown Author'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.purchased_at ? new Date(transaction.purchased_at).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {formatCurrency(transaction.amount_cents || 0)}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    Platform: {formatCurrency(transaction.platform_fee_cents || 0)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">No transactions found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
