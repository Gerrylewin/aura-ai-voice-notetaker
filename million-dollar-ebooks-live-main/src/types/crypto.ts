
export interface SplitContract {
  id: string;
  author_id: string;
  contract_address: string;
  chain_id: number;
  deployment_tx_hash?: string;
  platform_share_percentage: number;
  author_share_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CryptoTransaction {
  id: string;
  user_id: string;
  book_id?: string;
  author_id: string;
  split_contract_address: string;
  transaction_hash?: string;
  amount_usdc_cents: number;
  platform_fee_cents: number;
  author_earnings_cents: number;
  payment_status: 'pending' | 'completed' | 'failed';
  wallet_address: string;
  chain_id: number;
  gas_fee_wei?: string;
  block_number?: number;
  transaction_data: any;
  created_at: string;
  confirmed_at?: string;
  failed_at?: string;
  failure_reason?: string;
  books?: {
    title: string;
    author_name: string;
  };
}

export interface CryptoWithdrawal {
  id: string;
  user_id: string;
  split_contract_address: string;
  to_wallet_address: string;
  amount_usdc_cents: number;
  transaction_hash?: string;
  chain_id: number;
  status: 'pending' | 'completed' | 'failed';
  gas_fee_wei?: string;
  initiated_at: string;
  confirmed_at?: string;
  failed_at?: string;
  failure_reason?: string;
}

export interface PlatformCryptoEarning {
  id: string;
  transaction_id: string;
  amount_usdc_cents: number;
  contract_address: string;
  chain_id: number;
  withdrawn: boolean;
  withdrawn_at?: string;
  withdrawal_tx_hash?: string;
  created_at: string;
}

export interface WalletBalance {
  usdc: number; // in cents
  matic: number; // in wei (for gas)
}

export interface PaymentRequest {
  bookId: string;
  authorId: string;
  amountUsdcCents: number;
  buyerWalletAddress: string;
  splitContractAddress: string;
}
