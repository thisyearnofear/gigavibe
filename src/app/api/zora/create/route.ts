import { NextRequest, NextResponse } from 'next/server';
import { createCoin, DeployCurrency } from '@zoralabs/coins-sdk';
import { Address, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

/**
 * API route for creating a new Zora coin
 * This version accepts a signed transaction from the frontend
 * and broadcasts it to the blockchain
 */
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      symbol,
      uri,
      payoutRecipient,
      metadataJson,
      platformReferrer,
      message,
      signedTransaction // This is the signed transaction from the frontend
    } = await request.json();

    // Validate input parameters
    if (!name || !symbol || !(uri || metadataJson) || !payoutRecipient) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if we have a signed transaction
    if (!signedTransaction) {
      // No signed transaction provided, so we'll return what would be needed to create one
      // This is useful for the frontend to know what parameters to use when creating and signing the transaction
      
      // Set up viem client for parameter validation
      const publicClient = createPublicClient({
        chain: base,
        transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
      });

      // Use provided platform referrer or default to GigaVibe's developer wallet
      const createReferrerAddress = (platformReferrer as Address) ||
                             (process.env.NEXT_PUBLIC_ZORA_PLATFORM_REFERRER as Address) ||
                             '0x55A5705453Ee82c742274154136Fce8149597058'; // GigaVibe developer wallet
      
      // Parameters for the SDK call
      const createParams = {
        name,
        symbol,
        uri: uri || '', // URI takes precedence if provided
        payoutRecipient: payoutRecipient as Address,
        platformReferrer: createReferrerAddress,
        currency: DeployCurrency.ETH,
        chainId: base.id,
        metadataJson,
        ...(message ? { message } : {})
      };

      return NextResponse.json({
        success: false,
        needsSignature: true,
        message: "Transaction needs to be signed by the user. Use these parameters to create and sign the transaction.",
        parameters: createParams
      });
    }

    // We have a signed transaction, so we'll broadcast it to the blockchain
    
    // Set up viem client for broadcasting the transaction
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // Broadcast the signed transaction
    const transactionHash = await publicClient.sendRawTransaction({
      serializedTransaction: signedTransaction as `0x${string}`
    });

    // After broadcasting, we want to wait for the transaction to be mined
    const transactionReceipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash
    });

    // Extract the contract address from the transaction receipt logs
    // Zora tokens emit an event when created, we can parse this to get the token address
    const contractAddress = extractTokenAddressFromLogs(transactionReceipt.logs);

    return NextResponse.json({
      success: true,
      message: "Coin creation transaction broadcasted successfully",
      transactionHash,
      contractAddress,
      blockNumber: transactionReceipt.blockNumber,
      status: transactionReceipt.status
    });
  } catch (error) {
    console.error('Error in Zora create API:', error);
    return NextResponse.json(
      { error: String(error) || 'Failed to validate coin creation parameters' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to extract token contract address from transaction logs
 * @param logs Transaction receipt logs
 * @returns The contract address or undefined if not found
 */
function extractTokenAddressFromLogs(logs: any[]): Address | undefined {
  try {
    // In a real implementation, we would look for the specific event emitted by Zora's factory
    // when a new token is created. This event should contain the new token's address.
    
    // Example (actual implementation depends on Zora's contract event definitions):
    // Event topic for token creation (this is hypothetical - use the actual event signature)
    const TOKEN_CREATED_TOPIC = '0x65c90c0db89e64ef19f0bf6eccd8be7e0fbe8f078b2c010d8c5e7a7973336ff5';
    
    // Find the log entry that matches the token creation event
    const creationLog = logs.find(log =>
      log.topics && log.topics[0] === TOKEN_CREATED_TOPIC
    );
    
    if (creationLog) {
      // Extract the contract address from the log
      // Typically, for contract creation events, the contract address is either:
      // 1. The address of the log itself
      // 2. Encoded in the event data or topics
      
      // For simplicity, assuming it's the address of the log
      return creationLog.address as Address;
    }
    
    return undefined;
  } catch (error) {
    console.error('Error extracting token address from logs:', error);
    return undefined;
  }
}