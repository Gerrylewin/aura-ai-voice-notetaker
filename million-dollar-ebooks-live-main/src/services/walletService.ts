
import { supabase } from '@/integrations/supabase/client';

export interface WalletInfo {
  address: string;
  balance: number; // USDC balance in cents
  isConnected: boolean;
}

export class WalletService {
  // Update user's wallet address
  async updateWalletAddress(userId: string, walletAddress: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating wallet address:', error);
      throw error;
    }

    return data;
  }

  // Get user's wallet information
  async getWalletInfo(userId: string): Promise<WalletInfo | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching wallet info:', error);
      return null;
    }

    if (!data?.wallet_address) {
      return null;
    }

    return {
      address: data.wallet_address,
      balance: 0, // Will be fetched from blockchain
      isConnected: true,
    };
  }

  // Check if user has a wallet connected
  async hasWallet(userId: string): Promise<boolean> {
    const walletInfo = await this.getWalletInfo(userId);
    return walletInfo !== null;
  }

  // Get USDC balance for wallet (will be implemented with actual blockchain calls)
  async getUSDCBalance(walletAddress: string): Promise<number> {
    try {
      // TODO: Implement actual USDC balance fetching from Polygon
      // For now, return 0 - will be implemented with Thirdweb SDK
      return 0;
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      return 0;
    }
  }

  // Initiate withdrawal from split contract
  async initiateWithdrawal(userId: string, amountCents: number, toWalletAddress: string) {
    try {
      const { data, error } = await supabase.functions.invoke('initiate-crypto-withdrawal', {
        body: {
          userId,
          amountCents,
          toWalletAddress,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();
