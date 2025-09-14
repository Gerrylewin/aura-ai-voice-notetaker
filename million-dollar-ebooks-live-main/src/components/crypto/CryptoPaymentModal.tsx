
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAddress, useContract, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { Loader2, DollarSign, Coins, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';
import { USDC_CONTRACT_ADDRESS } from '@/services/cryptoService';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author_name: string;
    author_id: string;
    price_cents: number;
    cover_image_url?: string;
  };
  splitContractAddress: string;
}

export function CryptoPaymentModal({ 
  isOpen, 
  onClose, 
  book, 
  splitContractAddress 
}: CryptoPaymentModalProps) {
  const address = useAddress();
  const { toast } = useToast();
  const { processPayment } = useCryptoPayments();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { contract: usdcContract } = useContract(USDC_CONTRACT_ADDRESS);
  const { mutateAsync: transfer } = useContractWrite(usdcContract, 'transfer');

  const priceInUSDC = book.price_cents / 100; // Convert cents to USDC
  const priceInWei = ethers.utils.parseUnits(priceInUSDC.toString(), 6); // USDC has 6 decimals

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setTransactionHash('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!address || !splitContractAddress) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to make crypto payments',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      console.log('Starting USDC transfer...', {
        to: splitContractAddress,
        amount: priceInWei.toString(),
        priceInUSDC
      });

      // Transfer USDC to split contract
      const tx = await transfer({
        args: [splitContractAddress, priceInWei]
      });

      const txHash = tx.receipt?.transactionHash;
      console.log('USDC transfer completed:', { txHash, tx });

      if (!txHash) {
        throw new Error('Transaction hash not available');
      }

      setTransactionHash(txHash);

      // Process the payment in our backend with transaction verification
      console.log('Processing payment in backend...');
      const result = await processPayment({
        bookId: book.id,
        authorId: book.author_id,
        amountUsdcCents: book.price_cents,
        buyerWalletAddress: address,
        splitContractAddress,
        transactionHash: txHash,
      });

      console.log('Payment processing result:', result);

      if (result.verified) {
        setPaymentStatus('success');
        toast({
          title: 'Payment Successful!',
          description: `Successfully paid ${priceInUSDC.toFixed(2)} USDC. Book access granted!`,
        });

        // Close modal after success
        setTimeout(() => {
          onClose();
          setPaymentStatus('idle');
        }, 2000);
      } else {
        throw new Error(result.failureReason || 'Transaction verification failed');
      }

    } catch (error: any) {
      console.error('Payment failed:', error);
      setPaymentStatus('error');
      
      let errorMsg = 'Failed to process crypto payment. Please try again.';
      
      if (error.message?.includes('insufficient funds')) {
        errorMsg = 'Insufficient USDC balance. Please add more USDC to your wallet.';
      } else if (error.message?.includes('user rejected')) {
        errorMsg = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('network')) {
        errorMsg = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('verification failed')) {
        errorMsg = 'Transaction verification failed. Please contact support.';
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: 'Payment Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Crypto Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={book.cover_image_url || '/placeholder.svg'}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">{priceInUSDC.toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Book Price:</span>
              <span>{priceInUSDC.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee (10%):</span>
              <span>{(priceInUSDC * 0.1).toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Author Earnings (90%):</span>
              <span>{(priceInUSDC * 0.9).toFixed(2)} USDC</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{priceInUSDC.toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Wallet Status */}
          {address ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Wallet Connected</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Wallet Required</span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                Please connect your wallet to continue
              </p>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing payment...</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Payment successful!</span>
              </div>
              {transactionHash && (
                <div className="mt-2">
                  <a
                    href={`https://polygonscan.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 dark:text-green-500 hover:underline flex items-center gap-1"
                  >
                    View on PolygonScan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Payment failed</span>
              </div>
              {errorMessage && (
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                  {errorMessage}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!address || isProcessing || paymentStatus === 'success'}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : paymentStatus === 'success' ? (
                'Complete!'
              ) : (
                `Pay ${priceInUSDC.toFixed(2)} USDC`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
