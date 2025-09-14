
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Book, Eye, Download, Star, TrendingUp } from 'lucide-react';

interface BookAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    cover?: string;
  };
}

export function BookAnalyticsModal({ isOpen, onClose, book }: BookAnalyticsModalProps) {
  // Fetch real book analytics data
  const { data: bookData, isLoading: bookLoading } = useQuery({
    queryKey: ['book-details', book.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', book.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!book.id,
  });

  // Fetch purchase analytics
  const { data: purchaseData, isLoading: purchaseLoading } = useQuery({
    queryKey: ['book-purchases', book.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount_cents, purchased_at')
        .eq('book_id', book.id)
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!book.id,
  });

  // Fetch reviews
  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ['book-reviews', book.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating, review_text, created_at')
        .eq('book_id', book.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!book.id,
  });

  if (!isOpen) return null;

  const isLoading = bookLoading || purchaseLoading || reviewLoading;

  // Calculate metrics from real data
  const totalSales = purchaseData?.length || 0;
  const totalRevenue = purchaseData?.reduce((sum, purchase) => sum + (purchase.amount_cents || 0), 0) || 0;
  const averageRating = reviewData?.length > 0 
    ? reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length 
    : 0;

  // Process daily sales data
  const dailySalesData = purchaseData?.reduce((acc: any[], purchase) => {
    const date = new Date(purchase.purchased_at).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.sales += 1;
      existing.revenue += (purchase.amount_cents || 0) / 100;
    } else {
      acc.push({
        date,
        sales: 1,
        revenue: (purchase.amount_cents || 0) / 100
      });
    }
    return acc;
  }, []) || [];

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} Star${rating > 1 ? 's' : ''}`,
    count: reviewData?.filter(review => review.rating === rating).length || 0
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Book className="w-6 h-6 text-red-600" />
            Analytics for "{book.title}"
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookData?.view_count || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSales}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      from {reviewData?.length || 0} review{reviewData?.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailySalesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke="#ef4444" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No sales data available yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviewData && reviewData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={ratingDistribution.filter(item => item.count > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ rating, count }) => `${rating}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {ratingDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No reviews yet.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviewData && reviewData.length > 0 ? (
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {reviewData.slice(0, 5).map((review, index) => (
                          <div key={index} className="border-b pb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.review_text && (
                              <p className="text-sm text-gray-700">{review.review_text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No reviews yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Performance Summary</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• {bookData?.view_count || 0} total views</li>
                        <li>• {totalSales} copies sold</li>
                        <li>• ${(totalRevenue / 100).toFixed(2)} in total revenue</li>
                        <li>• {reviewData?.length || 0} reviews with an average rating of {averageRating.toFixed(1)}</li>
                      </ul>
                    </div>
                    
                    {totalSales === 0 && bookData?.view_count && bookData.view_count > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-yellow-800">Conversion Opportunity</h4>
                        <p className="text-sm text-yellow-700">
                          Your book has {bookData.view_count} views but no sales yet. Consider adjusting your pricing or improving your book description to convert more viewers into buyers.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
