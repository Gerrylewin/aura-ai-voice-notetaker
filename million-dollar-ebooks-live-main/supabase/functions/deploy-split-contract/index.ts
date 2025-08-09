
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const THIRDWEB_SECRET_KEY = Deno.env.get('THIRDWEB_SECRET_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeploySplitContractRequest {
  authorId: string
  authorWalletAddress: string
  platformWalletAddress: string
  authorShare: number // 90
  platformShare: number // 10
}

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEPLOY-SPLIT-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    logStep("Function started");

    const {
      authorId,
      authorWalletAddress,
      platformWalletAddress,
      authorShare = 90,
      platformShare = 10
    }: DeploySplitContractRequest = await req.json()

    logStep(`Processing split contract deployment for author ${authorId}`, {
      authorWalletAddress,
      platformWalletAddress,
      authorShare,
      platformShare
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Validate wallet addresses
    if (!authorWalletAddress || !authorWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid author wallet address');
    }
    if (!platformWalletAddress || !platformWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid platform wallet address');
    }

    // Check if author already has a split contract
    const { data: existingContract, error: checkError } = await supabase
      .from('split_contracts')
      .select('*')
      .eq('author_id', authorId)
      .eq('is_active', true)
      .single()

    if (!checkError && existingContract) {
      logStep(`Split contract already exists for author ${authorId}`, { 
        contractAddress: existingContract.contract_address 
      });
      return new Response(
        JSON.stringify({ 
          success: true, 
          contractAddress: existingContract.contract_address,
          message: 'Split contract already exists for this author'
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Deploy split contract using Thirdweb Engine API
    const deployPayload = {
      contractMetadata: {
        name: `Author Split Contract - ${authorId.slice(0, 8)}`,
        description: `Revenue split contract for author payments`,
        symbol: "SPLIT"
      },
      recipients: [authorWalletAddress, platformWalletAddress],
      shares: [authorShare * 100, platformShare * 100] // Convert to basis points
    }

    logStep('Deploying split contract with Thirdweb Engine', deployPayload);

    // Use Thirdweb's Engine API to deploy the split contract
    const deployResponse = await fetch('https://api.thirdweb.com/v1/engine/polygon/137/deploy/split', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${THIRDWEB_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'X-Client-Info': 'supabase-edge-function'
      },
      body: JSON.stringify({
        contractMetadata: deployPayload.contractMetadata,
        recipients: deployPayload.recipients,
        shares: deployPayload.shares
      }),
    })

    logStep(`Thirdweb Engine API response status: ${deployResponse.status}`);
    
    if (!deployResponse.ok) {
      const errorText = await deployResponse.text()
      logStep(`Thirdweb Engine API error: ${deployResponse.status} - ${errorText}`);
      throw new Error(`Failed to deploy split contract: ${errorText}`);
    }

    const deployResult = await deployResponse.json()
    logStep('Thirdweb Engine deploy result', deployResult);
    
    const contractAddress = deployResult.contractAddress || deployResult.address;
    const transactionHash = deployResult.transactionHash || deployResult.txHash;

    if (!contractAddress) {
      throw new Error('No contract address returned from Thirdweb Engine');
    }

    // Store contract information in database
    const { data: contractData, error: insertError } = await supabase
      .from('split_contracts')
      .insert({
        author_id: authorId,
        contract_address: contractAddress,
        chain_id: 137,
        deployment_tx_hash: transactionHash,
        platform_share_percentage: platformShare,
        author_share_percentage: authorShare,
      })
      .select()
      .single()

    if (insertError) {
      logStep('Error storing contract data', insertError);
      throw insertError
    }

    // Update author profile with contract address
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ split_contract_address: contractAddress })
      .eq('id', authorId)

    if (updateError) {
      logStep('Error updating author profile', updateError);
    }

    logStep(`Split contract deployed successfully for author ${authorId}`, {
      contractAddress,
      transactionHash
    });

    return new Response(
      JSON.stringify({
        success: true,
        contractAddress,
        transactionHash,
        chainId: 137,
        authorShare,
        platformShare,
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    logStep('ERROR in deploy-split-contract function', { 
      message: error.message,
      stack: error.stack 
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to deploy split contract. Please check your wallet address and try again.',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
