
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const THIRDWEB_SECRET_KEY = Deno.env.get('THIRDWEB_SECRET_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPaymentRequest {
  bookId: string
  authorId: string
  amountUsdcCents: number
  buyerWalletAddress: string
  splitContractAddress: string
  transactionHash?: string
}

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-CRYPTO-PAYMENT] ${step}${detailsStr}`);
};

// Verify transaction on Polygon blockchain
async function verifyTransaction(txHash: string, expectedAmount: number, contractAddress: string) {
  try {
    logStep('Verifying transaction on blockchain', { txHash, expectedAmount, contractAddress });
    
    // Call Polygon RPC to get transaction details
    const rpcResponse = await fetch('https://polygon-rpc.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      })
    });

    const rpcResult = await rpcResponse.json();
    
    if (rpcResult.error) {
      logStep('RPC Error', rpcResult.error);
      return { verified: false, error: rpcResult.error.message };
    }

    const receipt = rpcResult.result;
    if (!receipt) {
      return { verified: false, error: 'Transaction not found or not confirmed' };
    }

    // Check if transaction was successful
    const success = receipt.status === '0x1';
    logStep('Transaction verification result', { 
      success, 
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed 
    });

    return { 
      verified: success,
      blockNumber: parseInt(receipt.blockNumber, 16),
      gasUsed: receipt.gasUsed,
      error: success ? null : 'Transaction failed on blockchain'
    };
  } catch (error) {
    logStep('Error verifying transaction', error);
    return { verified: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    logStep("Function started");

    const {
      bookId,
      authorId,
      amountUsdcCents,
      buyerWalletAddress,
      splitContractAddress,
      transactionHash
    }: ProcessPaymentRequest = await req.json()

    logStep('Processing crypto payment', {
      bookId,
      authorId,
      amountUsdcCents,
      buyerWalletAddress,
      splitContractAddress,
      transactionHash
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get auth user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    logStep('User authenticated', { userId: user.id });

    // Calculate platform fee (10%) and author earnings (90%)
    const platformFeeCents = Math.round(amountUsdcCents * 0.10)
    const authorEarningsCents = amountUsdcCents - platformFeeCents

    let paymentStatus = 'pending';
    let confirmedAt = null;
    let blockNumber = null;
    let gasUsed = null;
    let failureReason = null;

    // If transaction hash is provided, verify it on the blockchain
    if (transactionHash) {
      logStep('Verifying transaction on blockchain', { transactionHash });
      
      const verification = await verifyTransaction(
        transactionHash, 
        amountUsdcCents, 
        splitContractAddress
      );

      if (verification.verified) {
        paymentStatus = 'completed';
        confirmedAt = new Date().toISOString();
        blockNumber = verification.blockNumber;
        gasUsed = verification.gasUsed;
        logStep('Transaction verified successfully', verification);
      } else {
        paymentStatus = 'failed';
        failureReason = verification.error;
        logStep('Transaction verification failed', verification);
      }
    }

    // Create crypto transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('crypto_transactions')
      .insert({
        user_id: user.id,
        book_id: bookId,
        author_id: authorId,
        split_contract_address: splitContractAddress,
        transaction_hash: transactionHash,
        amount_usdc_cents: amountUsdcCents,
        platform_fee_cents: platformFeeCents,
        author_earnings_cents: authorEarningsCents,
        payment_status: paymentStatus,
        wallet_address: buyerWalletAddress,
        chain_id: 137,
        block_number: blockNumber,
        gas_fee_wei: gasUsed,
        confirmed_at: confirmedAt,
        failed_at: paymentStatus === 'failed' ? new Date().toISOString() : null,
        failure_reason: failureReason,
      })
      .select()
      .single()

    if (transactionError) {
      logStep('Error creating crypto transaction', transactionError);
      throw transactionError
    }

    logStep('Crypto transaction created', { transactionId: transaction.id, paymentStatus });

    // Create purchase record linking to crypto transaction (only if payment is completed)
    let purchase = null;
    if (paymentStatus === 'completed') {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          book_id: bookId,
          amount_cents: amountUsdcCents,
          author_earnings_cents: authorEarningsCents,
          commission_cents: platformFeeCents,
          payment_status: 'completed',
          payment_method: 'crypto',
          crypto_transaction_id: transaction.id,
        })
        .select()
        .single()

      if (purchaseError) {
        logStep('Error creating purchase record', purchaseError);
        // Don't throw here, crypto transaction is already created
      } else {
        purchase = purchaseData;
        logStep('Purchase record created', { purchaseId: purchase.id });
      }

      // Send notification to author
      await supabase
        .from('notifications')
        .insert({
          user_id: authorId,
          type: 'crypto_payment_received',
          title: 'Crypto Payment Received',
          message: `You received $${(authorEarningsCents / 100).toFixed(2)} USDC for your book purchase!`,
          data: {
            amount_usdc_cents: authorEarningsCents,
            transaction_hash: transactionHash,
            book_id: bookId,
          },
        })

      logStep('Author notification sent');
    }

    logStep(`Crypto payment processed successfully: ${transaction.id}`, {
      paymentStatus,
      transactionHash,
      blockNumber
    });

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        purchaseId: purchase?.id,
        amountUsdcCents,
        platformFeeCents,
        authorEarningsCents,
        status: paymentStatus,
        verified: paymentStatus === 'completed',
        blockNumber,
        failureReason,
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    logStep('ERROR in process-crypto-payment function', { 
      message: error.message,
      stack: error.stack 
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process crypto payment'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
