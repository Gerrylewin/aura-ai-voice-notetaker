
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentPurchasesCardProps {
  recentPurchases: Array<{
    amount_cents: number;
    purchased_at: string;
    books?: {
      title: string;
      author_name: string;
    };
  }>;
}

export function RecentPurchasesCard({ recentPurchases }: RecentPurchasesCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Recent Purchases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentPurchases.slice(0, 10).map((purchase, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800">
              <div>
                <span className="text-sm text-white">{purchase.books?.title || 'Unknown Book'}</span>
                <p className="text-xs text-gray-400">by {purchase.books?.author_name || 'Unknown Author'}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-green-400">${(purchase.amount_cents / 100).toFixed(2)}</span>
                <p className="text-xs text-gray-500">
                  {new Date(purchase.purchased_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {recentPurchases.length === 0 && (
            <p className="text-center text-gray-400 py-4">No purchases yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
