
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { WalletConnect } from '@/components/crypto/WalletConnect';
import { CryptoEarningsDashboard } from '@/components/crypto/CryptoEarningsDashboard';
import { useAuth } from '@/hooks/useAuth';

export function CryptoEarningsSettings() {
  const { profile } = useAuth();

  // Allow writers, admins, and moderators to access crypto earnings
  const canAccessCryptoEarnings = profile?.user_role && ['writer', 'admin', 'moderator'].includes(profile.user_role);

  if (!canAccessCryptoEarnings) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Coins className="w-5 h-5" />
            Crypto Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Elevated Account Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be a writer, moderator, or admin to access crypto earnings features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Coins className="w-5 h-5" />
            Crypto Earnings & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Crypto Payments with USDC
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Connect your wallet to receive payments in USDC on Polygon network. 
                    You'll earn 90% of each sale, with 10% going to platform fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Connection
                </h5>
                <WalletConnect />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CryptoEarningsDashboard />
    </div>
  );
}
