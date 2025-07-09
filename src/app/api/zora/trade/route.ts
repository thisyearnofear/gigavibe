import { NextRequest, NextResponse } from 'next/server';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { Address, createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

// Define the trade parameters type to match SDK requirements
type TradeParams = {
  direction: 'buy' | 'sell';
  target: Address;
  amountIn: bigint;
  slippage: number;
  sender: Address;
  args: {
    recipient: Address;
    orderSize: bigint;
    minAmountOut?: bigint;
    sqrtPriceLimitX96?: bigint;
    tradeReferrer?: Address;
  };
};

/**
 * API route for trading Zora coins (buy/sell)
 * Keeps Zora SDK usage server-side only
 */
export async function POST(request: NextRequest) {
  try {
    const {
      action,
      coinAddress,
      userAddress,
      amountIn,
      slippage,
      tradeReferrer // Add trade referrer parameter
    } = await request.json();

    // Validate input parameters
    if (!action || !coinAddress || !userAddress || !amountIn) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (action !== 'buy' && action !== 'sell') {
      return NextResponse.json(
        { error: 'Action must be either "buy" or "sell"' },
        { status: 400 }
      );
    }

    // Set up viem clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // We need a wallet client with account to execute trades
    // But for API validation, we can return simulated results
    
    // Convert amountIn to bigint (assuming it's passed as a string)
    const amountInBigInt = BigInt(amountIn);

    // Prepare trade parameters
    const tradeParameters: TradeParams = {
      direction: action === 'buy' ? 'buy' : 'sell',
      target: coinAddress as Address,
      amountIn: amountInBigInt,
      slippage: slippage || 0.5, // Default slippage of 0.5%
      sender: userAddress as Address,
      args: {
        recipient: userAddress as Address,
        orderSize: amountInBigInt,
        // Include trade referrer if provided to earn 15% of trading fees
        ...(tradeReferrer ? { tradeReferrer: tradeReferrer as Address } : {})
      }
    };

    // In the client-side context, we'd need to pass the user's wallet
    // Here in the API, we can simulate or return parameters
    // The actual transaction will need to be signed by the user's wallet
    return NextResponse.json({
      success: true,
      message: "Trade parameters validated. Use the FE client for execution.",
      parameters: {
        ...tradeParameters,
        // Convert BigInts to strings for JSON serialization
        amountIn: amountInBigInt.toString(),
        args: {
          ...tradeParameters.args,
          orderSize: tradeParameters.args.orderSize.toString(),
        }
      }
    });
  } catch (error) {
    console.error('Error in Zora trade API:', error);
    return NextResponse.json(
      { error: String(error) || 'Failed to validate trade parameters' },
      { status: 500 }
    );
  }
}