import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Define standard ERC20 ABI for the functions we need
const erc20Abi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * API route for retrieving a user's balance of a specific Zora coin
 * Keeps blockchain interactions server-side only
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress');
    const coinAddress = searchParams.get('coinAddress');

    if (!userAddress || !coinAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: userAddress and coinAddress' },
        { status: 400 }
      );
    }

    // Set up viem client
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // Get user balance and token info
    const [balance, decimals, symbol] = await Promise.all([
      // Get token balance
      publicClient.readContract({
        address: coinAddress as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress as Address]
      }),
      // Get token decimals
      publicClient.readContract({
        address: coinAddress as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      // Get token symbol
      publicClient.readContract({
        address: coinAddress as Address,
        abi: erc20Abi,
        functionName: 'symbol',
      })
    ]);

    // Format the balance for display (convert from raw to decimal)
    const formattedBalance = formatTokenAmount(balance as bigint, decimals as number);

    return NextResponse.json({
      userAddress,
      coinAddress,
      balance: balance.toString(),
      formattedBalance,
      symbol,
      decimals
    });
  } catch (error) {
    console.error('Error in Zora balance API:', error);
    return NextResponse.json(
      { error: String(error) || 'Failed to retrieve balance information' },
      { status: 500 }
    );
  }
}

/**
 * Format a token amount from raw (wei) to decimal representation
 * @param amount Raw token amount as bigint
 * @param decimals Token decimals (usually 18)
 * @returns Formatted string with appropriate decimal places
 */
function formatTokenAmount(amount: bigint, decimals: number): string {
  try {
    // Convert to string first
    const amountStr = amount.toString();
    
    // If amount is 0, return "0"
    if (amountStr === "0") return "0";
    
    // If amount is less than 10^decimals, we need to add leading zeros
    if (amountStr.length <= decimals) {
      const zerosToAdd = decimals - amountStr.length;
      return "0." + "0".repeat(zerosToAdd) + amountStr;
    }
    
    // Insert decimal point at the right position
    const decimalIndex = amountStr.length - decimals;
    const integerPart = amountStr.slice(0, decimalIndex);
    const fractionalPart = amountStr.slice(decimalIndex);
    
    return integerPart + "." + fractionalPart;
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return amount.toString();
  }
}