
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cryptoService } from '@/services/cryptoService';
import { walletService } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';

export function useCryptoAuthor() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [splitContract, setSplitContract] = useState<any>(null);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deployingContract, setDeployingContract] = useState(false);

  // Check if user can access crypto earnings (writers, admins, moderators)
  const canAccessCryptoEarnings = profile?.user_role && ['writer', 'admin', 'moderator'].includes(profile.user_role);

  // Fetch author's split contract
  const fetchSplitContract = async () => {
    if (!user || !canAccessCryptoEarnings) return;
    
    try {
      const contract = await cryptoService.getSplitContract(user.id);
      setSplitContract(contract);
    } catch (error) {
      console.error('Error fetching split contract:', error);
    }
  };

  // Fetch author earnings
  const fetchEarnings = async () => {
    if (!user || !canAccessCryptoEarnings) return;
    
    try {
      const earningsAmount = await cryptoService.getAuthorEarnings(user.id);
      setEarnings(earningsAmount);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  // Deploy split contract for author
  const deploySplitContract = async (authorWalletAddress: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    if (!cryptoService.isValidWalletAddress(authorWalletAddress)) {
      throw new Error('Please enter a valid Ethereum wallet address (starting with 0x)');
    }
    
    setDeployingContract(true);
    try {
      const result = await cryptoService.deploySplitContract(
        user.id,
        authorWalletAddress
      );

      if (result.success) {
        toast({
          title: 'Crypto Payments Enabled!',
          description: 'Your payment contract has been deployed successfully on Polygon mainnet!',
        });

        // Refresh contract data
        await fetchSplitContract();
        
        return result;
      } else {
        throw new Error(result.error || 'Failed to deploy contract');
      }
    } catch (error: any) {
      console.error('Error deploying split contract:', error);
      
      let errorMessage = 'Failed to deploy split contract. Please try again.';
      if (error.message.includes('wallet address')) {
        errorMessage = 'Please enter a valid wallet address starting with 0x';
      } else if (error.message.includes('already exists')) {
        errorMessage = 'You already have a crypto payment contract set up';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for contract deployment. Please add MATIC to your wallet.';
      }
      
      toast({
        title: 'Setup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setDeployingContract(false);
    }
  };

  // Initiate withdrawal
  const initiateWithdrawal = async (amountCents: number, toWalletAddress: string) => {
    if (!user) return;
    
    if (!cryptoService.isValidWalletAddress(toWalletAddress)) {
      throw new Error('Please enter a valid wallet address');
    }
    
    try {
      const result = await walletService.initiateWithdrawal(user.id, amountCents, toWalletAddress);
      
      toast({
        title: 'Withdrawal Initiated',
        description: `Withdrawal of $${cryptoService.formatUSDC(amountCents)} USDC has been initiated`,
      });
      
      // Refresh earnings
      await fetchEarnings();
      
      return result;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      toast({
        title: 'Withdrawal Failed',
        description: 'Failed to initiate withdrawal. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user && canAccessCryptoEarnings) {
      fetchSplitContract();
      fetchEarnings();
    }
  }, [user, profile, canAccessCryptoEarnings]);

  return {
    splitContract,
    earnings,
    loading,
    deployingContract,
    canAccessCryptoEarnings,
    deploySplitContract,
    initiateWithdrawal,
    fetchSplitContract,
    fetchEarnings,
    formatUSDC: cryptoService.formatUSDC,
  };
}
