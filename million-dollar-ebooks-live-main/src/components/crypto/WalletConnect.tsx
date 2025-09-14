
import React, { useState } from 'react';
import { ConnectWallet, useAddress, useConnectionStatus, useWallet } from '@thirdweb-dev/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';

export function WalletConnect() {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const wallet = useWallet();
  const { toast } = useToast();
  const { updateWalletAddress, walletInfo } = useCryptoPayments();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConnectWallet = async () => {
    if (address && address !== walletInfo?.address) {
      setIsUpdating(true);
      try {
        await updateWalletAddress(address);
      } catch (error) {
        console.error('Failed to update wallet address:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Crypto Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'disconnected' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect your wallet to make crypto payments with USDC
            </p>
            <ConnectWallet 
              theme="light"
              btnTitle="Connect Wallet"
              modalTitle="Choose Wallet"
              switchToActiveChain={true}
              modalSize="wide"
            />
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connecting wallet...</p>
          </div>
        )}

        {connectionStatus === 'connected' && address && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
              <p className="font-mono text-sm">{formatAddress(address)}</p>
            </div>

            {wallet && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Wallet Type</p>
                <p className="text-sm capitalize">{wallet.walletId}</p>
              </div>
            )}

            {address !== walletInfo?.address && (
              <Button
                onClick={handleConnectWallet}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Save Wallet Address'}
              </Button>
            )}

            {address === walletInfo?.address && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Wallet address saved to profile
              </div>
            )}
          </div>
        )}

        {connectionStatus === 'unknown' && (
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unable to detect wallet connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
