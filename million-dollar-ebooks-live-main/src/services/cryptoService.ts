
import { supabase } from '@/integrations/supabase/client';

// USDC contract address on Polygon
export const USDC_CONTRACT_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// Platform wallet address for receiving fees
export const PLATFORM_WALLET_ADDRESS = '0xc32c7deA22f43A44971A73230a1cF8b93DDcA5C9';

export class CryptoService {
  // Get user's crypto transactions
  async getCryptoTransactions(userId: string) {
    const { data, error } = await supabase
      .from('crypto_transactions')
      .select(`
        *,
        books(title, author_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get author's split contract
  async getSplitContract(authorId: string) {
    const { data, error } = await supabase
      .from('split_contracts')
      .select('*')
      .eq('author_id', authorId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get author's crypto earnings
  async getAuthorEarnings(authorId: string) {
    const { data, error } = await supabase
      .from('crypto_transactions')
      .select('author_earnings_cents')
      .eq('author_id', authorId)
      .eq('payment_status', 'completed');

    if (error) throw error;
    
    const totalEarnings = data?.reduce((sum, tx) => sum + (tx.author_earnings_cents || 0), 0) || 0;
    return totalEarnings;
  }

  // Deploy split contract for author
  async deploySplitContract(authorId: string, authorWalletAddress: string) {
    const { data, error } = await supabase.functions.invoke('deploy-split-contract', {
      body: {
        authorId,
        authorWalletAddress,
        platformWalletAddress: PLATFORM_WALLET_ADDRESS,
        authorShare: 90,
        platformShare: 10,
      },
    });

    if (error) throw error;
    return data;
  }

  // Process a crypto payment
  async processPayment(paymentData: {
    bookId: string;
    authorId: string;
    amountUsdcCents: number;
    buyerWalletAddress: string;
    splitContractAddress: string;
    transactionHash?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('process-crypto-payment', {
      body: paymentData,
    });

    if (error) throw error;
    return data;
  }

  // Get transaction status
  async getTransactionStatus(transactionId: string) {
    const { data, error } = await supabase
      .from('crypto_transactions')
      .select('payment_status, failure_reason, confirmed_at, transaction_hash')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  }

  // Format USDC amount for display
  formatUSDC(amountCents: number): string {
    return (amountCents / 100).toFixed(2);
  }

  // Validate wallet address
  isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

export const cryptoService = new CryptoService();
