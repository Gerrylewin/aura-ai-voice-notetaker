
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCryptoAuthor } from '@/hooks/useCryptoAuthor';
import { WalletConnect } from '@/components/crypto/WalletConnect';
import { Wallet, CreditCard, Coins, Shield, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

export function PaymentSettings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { 
    splitContract, 
    deploySplitContract, 
    deployingContract, 
    canAccessCryptoEarnings 
  } = useCryptoAuthor();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeploySplitContract = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: 'Wallet Address Required',
        description: 'Please enter your wallet address to receive payments.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await deploySplitContract(walletAddress.trim());
      setWalletAddress('');
    } catch (error: any) {
      // Error handling is done in the hook
      console.error('Contract deployment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={canAccessCryptoEarnings ? "receive" : "purchase"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receive" disabled={!canAccessCryptoEarnings}>
            <Wallet className="w-4 h-4 mr-2" />
            Receive Payments
          </TabsTrigger>
          <TabsTrigger value="purchase">
            <CreditCard className="w-4 h-4 mr-2" />
            Purchase Books
          </TabsTrigger>
        </TabsList>

        {/* Receive Payments Tab - Writers, Admins, and Moderators */}
        <TabsContent value="receive" className="space-y-4">
          {!canAccessCryptoEarnings ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Elevated Account Required</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You need to be a writer, moderator, or admin to receive payments from readers.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {splitContract?.contract_address ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Coins className="w-5 h-5" />
                      Crypto Payments Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                        ✅ Your crypto payment system is set up and active!
                      </p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Contract Address:</span>
                          <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded mt-1 break-all">
                            {splitContract.contract_address}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Your Share:</span> 90%
                        </div>
                        <div>
                          <span className="font-medium">Platform Fee:</span> 10%
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-2">Readers can now purchase your books using USDC on Polygon network.</p>
                      <p>Payments will be automatically split and sent to your wallet address.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Set Up Crypto Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Enable crypto payments to receive USDC directly from readers.
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Readers pay with USDC on Polygon network</li>
                        <li>• You receive 90% of each sale</li>
                        <li>• Payments sent directly to your wallet</li>
                        <li>• No waiting periods or manual processing</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="wallet">Your Polygon Wallet Address</Label>
                        <Input
                          id="wallet"
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="0x1234567890abcdef1234567890abcdef12345678"
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a valid Ethereum/Polygon wallet address (42 characters starting with 0x)
                        </p>
                      </div>

                      {deployingContract && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Setting up your crypto payment contract...
                        </div>
                      )}

                      <Button 
                        onClick={handleDeploySplitContract}
                        disabled={isSubmitting || deployingContract || !walletAddress.trim()}
                        className="w-full"
                      >
                        {isSubmitting || deployingContract ? 'Setting up...' : 'Enable Crypto Payments'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Purchase Books Tab - All Users */}
        <TabsContent value="purchase" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Connection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
              <WalletConnect />
            </div>

            {/* Purchase Information Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Crypto Payments (USDC)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Purchase books directly with USDC on the Polygon network for instant access.
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Network:</span>
                        <Badge variant="outline">Polygon</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Accepted Token:</span>
                        <Badge variant="outline">USDC</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Method:</span>
                        <Badge variant="outline">Wallet Connection</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Benefits</span>
                    </div>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Support creators directly (90% revenue share)</li>
                      <li>• Instant access after payment confirmation</li>
                      <li>• Global accessibility without banking restrictions</li>
                      <li>• Transparent, blockchain-verified transactions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Setup Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>A Polygon-compatible wallet (MetaMask, WalletConnect, etc.)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>USDC tokens on the Polygon network</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Small amount of MATIC for transaction fees</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t mt-4">
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <ExternalLink className="w-4 h-4" />
                      <a href="https://wallet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Get a Polygon wallet
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
