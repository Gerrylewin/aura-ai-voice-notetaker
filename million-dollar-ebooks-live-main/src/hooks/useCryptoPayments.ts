
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cryptoService } from '@/services/cryptoService';
import { walletService } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';

export function useCryptoPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  // Fetch user's crypto transactions
  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await cryptoService.getCryptoTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching crypto transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch crypto transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet information
  const fetchWalletInfo = async () => {
    if (!user) return;
    
    try {
      const info = await walletService.getWalletInfo(user.id);
      setWalletInfo(info);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  // Process a crypto payment
  const processPayment = async (paymentData: {
    bookId: string;
    authorId: string;
    amountUsdcCents: number;
    buyerWalletAddress: string;
    splitContractAddress: string;
    transactionHash?: string;
  }) => {
    try {
      const result = await cryptoService.processPayment(paymentData);
      
      toast({
        title: 'Payment Successful!',
        description: `Successfully paid $${cryptoService.formatUSDC(paymentData.amountUsdcCents)} USDC`,
      });

      // Refresh transactions
      await fetchTransactions();
      
      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process crypto payment. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update wallet address
  const updateWalletAddress = async (walletAddress: string) => {
    if (!user) return;
    
    try {
      await walletService.updateWalletAddress(user.id, walletAddress);
      await fetchWalletInfo();
      
      toast({
        title: 'Wallet Connected',
        description: 'Your crypto wallet has been connected successfully',
      });
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchWalletInfo();
    }
  }, [user]);

  return {
    transactions,
    walletInfo,
    loading,
    processPayment,
    updateWalletAddress,
    fetchTransactions,
    fetchWalletInfo,
  };
}
