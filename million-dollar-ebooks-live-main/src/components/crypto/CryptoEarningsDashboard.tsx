
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp, 
  Download, 
  Clock, 
  DollarSign,
  Wallet
} from 'lucide-react';
import { useCryptoAuthor } from '@/hooks/useCryptoAuthor';
import { WalletConnect } from './WalletConnect';

export function CryptoEarningsDashboard() {
  const { 
    splitContract, 
    earnings, 
    deployingContract, 
    deploySplitContract, 
    initiateWithdrawal,
    formatUSDC 
  } = useCryptoAuthor();

  const handleDeployContract = async () => {
    // This would typically get the wallet address from connected wallet
    const walletAddress = '0x...'; // Replace with actual connected wallet address
    await deploySplitContract(walletAddress);
  };

  const handleWithdraw = async () => {
    const withdrawalAmount = earnings; // Withdraw all earnings
    const walletAddress = '0x...'; // Replace with actual connected wallet address
    await initiateWithdrawal(withdrawalAmount, walletAddress);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Earnings Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crypto Earnings</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUSDC(earnings)}</div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        {/* Split Contract Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Split Contract</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {splitContract ? (
              <div>
                <Badge variant="secondary" className="mb-2">Active</Badge>
                <p className="text-xs text-muted-foreground">
                  90% Author / 10% Platform
                </p>
              </div>
            ) : (
              <div>
                <Badge variant="outline" className="mb-2">Not Deployed</Badge>
                <p className="text-xs text-muted-foreground">
                  Deploy to start earning crypto
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {!splitContract && (
              <Button
                size="sm"
                onClick={handleDeployContract}
                disabled={deployingContract}
                className="w-full"
              >
                {deployingContract ? 'Deploying...' : 'Setup Crypto Earnings'}
              </Button>
            )}
            
            {splitContract && earnings > 0 && (
              <Button
                size="sm"
                onClick={handleWithdraw}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Withdraw Earnings
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallet Connection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletConnect />
        
        {/* Contract Details */}
        {splitContract && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                <p className="font-mono text-sm break-all">
                  {splitContract.contract_address}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Share</p>
                  <p className="text-lg font-bold text-green-600">
                    {splitContract.author_share_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Platform Share</p>
                  <p className="text-lg font-bold text-blue-600">
                    {splitContract.platform_share_percentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  Deployed {new Date(splitContract.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
