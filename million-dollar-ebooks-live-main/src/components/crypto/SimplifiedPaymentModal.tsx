import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  CreditCard,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react';

interface SimplifiedPaymentModalProps {
  book: {
    id: string;
    title: string;
    author_name: string;
    price_cents: number;
    cover_image_url?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SimplifiedPaymentModal({ 
  book, 
  isOpen, 
  onClose, 
  onSuccess 
}: SimplifiedPaymentModalProps) {
  const [step, setStep] = useState<'connect' | 'pay' | 'confirm' | 'success'>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { 
    connectWallet, 
    isWalletConnected, 
    walletAddress, 
    buyBookWithCrypto, 
    isLoading: isPaymentLoading 
  } = useCryptoPayments();
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep('connect');
      setError(null);
      setTxHash(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isWalletConnected && step === 'connect') {
      setStep('pay');
    }
  }, [isWalletConnected, step]);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await connectWallet();
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been connected successfully.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      toast({
        title: 'Connection Failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);
    setStep('confirm');
    
    try {
      const result = await buyBookWithCrypto(book.id, book.price_cents);
      
      if (result.success) {
        setTxHash(result.transactionHash);
        setStep('success');
        
        toast({
          title: 'Purchase Successful!',
          description: 'Your book has been purchased and added to your library.',
        });
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
      setStep('pay');
      
      toast({
        title: 'Purchase Failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStepIcon = (stepName: string, currentStep: string) => {
    const isActive = stepName === currentStep;
    const isCompleted = ['connect', 'pay', 'confirm', 'success'].indexOf(stepName) < 
                       ['connect', 'pay', 'confirm', 'success'].indexOf(currentStep);
    
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-accent" />;
    } else if (isActive) {
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Purchase Book</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Book Info */}
          <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
            {book.cover_image_url && (
              <img 
                src={book.cover_image_url} 
                alt={book.title}
                className="w-16 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author_name}</p>
              <Badge variant="secondary" className="mt-2">
                {formatPrice(book.price_cents)}
              </Badge>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {getStepIcon('connect', step)}
              <span className={step === 'connect' ? 'font-medium' : 'text-muted-foreground'}>
                Connect Wallet
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {getStepIcon('pay', step)}
              <span className={step === 'pay' ? 'font-medium' : 'text-muted-foreground'}>
                Confirm Payment
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {getStepIcon('confirm', step)}
              <span className={step === 'confirm' ? 'font-medium' : 'text-muted-foreground'}>
                Processing
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {getStepIcon('success', step)}
              <span className={step === 'success' ? 'font-medium' : 'text-muted-foreground'}>
                Complete
              </span>
            </div>
          </div>

          {/* Step Content */}
          {step === 'connect' && (
            <div className="space-y-4">
              <div className="text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your crypto wallet to purchase this book with USDC
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Secure blockchain transaction</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span>Instant payment processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>90% goes directly to the author</span>
                </div>
              </div>
              
              <Button 
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'pay' && (
            <div className="space-y-4">
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="font-semibold mb-2">Confirm Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Pay {formatPrice(book.price_cents)} USDC to purchase this book
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Book Price:</span>
                  <span className="font-medium">{formatPrice(book.price_cents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Network Fee:</span>
                  <span className="text-muted-foreground">~$0.01</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(book.price_cents)}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Connected to: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </div>
              
              <Button 
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Pay {formatPrice(book.price_cents)} USDC
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <h3 className="font-semibold">Processing Payment</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your transaction...
              </p>
              <Progress value={75} className="w-full" />
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-accent" />
              <h3 className="font-semibold text-accent">Purchase Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your book has been added to your library.
              </p>
              {txHash && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Transaction Hash:</div>
                  <div className="font-mono text-xs break-all">{txHash}</div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Close Button */}
          {step !== 'success' && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
