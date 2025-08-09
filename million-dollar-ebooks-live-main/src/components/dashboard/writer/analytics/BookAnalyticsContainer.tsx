
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Book, DollarSign, ShoppingCart, Star } from 'lucide-react';

export function BookAnalyticsContainer() {
  const { user } = useAuth();

  // Fetch book analytics data
  const { data: bookAnalytics, isLoading } = useQuery({
    queryKey: ['book-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: books, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          view_count,
          download_count,
          price_cents,
          rating_average,
          rating_count,
          created_at
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get purchase data for these books
      const bookIds = books?.map(book => book.id) || [];
      const { data: purchases } = await supabase
        .from('purchases')
        .select('book_id, amount_cents, purchased_at')
        .in('book_id', bookIds)
        .eq('payment_status', 'completed');

      // Combine book data with purchase stats
      return books?.map(book => {
        const bookPurchases = purchases?.filter(p => p.book_id === book.id) || [];
        const totalSales = bookPurchases.length;
        const totalRevenue = bookPurchases.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;

        return {
          ...book,
          sales_count: totalSales,
          revenue: totalRevenue,
          view_count: book.view_count || 0,
          download_count: book.download_count || 0,
        };
      }) || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!bookAnalytics || bookAnalytics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No book analytics data available. Publish your first book to see analytics here!
      </div>
    );
  }

  // Calculate totals
  const totalBooks = bookAnalytics.length;
  const totalSales = bookAnalytics.reduce((sum, book) => sum + book.sales_count, 0);
  const totalRevenue = bookAnalytics.reduce((sum, book) => sum + book.revenue, 0);
  const avgRating = bookAnalytics
    .filter(book => book.rating_count > 0)
    .reduce((sum, book) => sum + (book.rating_average || 0), 0) / 
    bookAnalytics.filter(book => book.rating_count > 0).length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Published Books</CardTitle>
            <Book className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalBooks}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Book Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookAnalytics}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis 
                dataKey="title" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)', 
                  border: '1px solid var(--border)',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="sales_count" fill="#dc2626" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Book Details Table */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Book Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Sales</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Revenue</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Rating</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Views</th>
                </tr>
              </thead>
              <tbody>
                {bookAnalytics.map((book) => (
                  <tr key={book.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{book.title}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{book.sales_count}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">${book.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {book.rating_count > 0 ? `${book.rating_average?.toFixed(1)} (${book.rating_count})` : 'No ratings'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{book.view_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
