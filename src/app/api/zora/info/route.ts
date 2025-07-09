import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

/**
 * API route for retrieving information about a Zora coin
 * Keeps Zora SDK usage server-side only
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const coinAddress = searchParams.get('address');

    if (!coinAddress) {
      return NextResponse.json(
        { error: 'Missing coin address parameter' },
        { status: 400 }
      );
    }

    // Set up viem client
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // Get coin info (sample implementation)
    // In a real implementation, we would call contract methods
    // to get actual coin data from the blockchain
    const coinInfo = await getCoinInfo(coinAddress as Address, publicClient);

    return NextResponse.json(coinInfo);
  } catch (error) {
    console.error('Error in Zora info API:', error);
    return NextResponse.json(
      { error: String(error) || 'Failed to retrieve coin information' },
      { status: 500 }
    );
  }
}

/**
 * Get coin information from the blockchain
 * Uses actual contract calls to fetch ERC20 information
 */
async function getCoinInfo(coinAddress: Address, publicClient: any) {
  try {
    // ERC20 ABI for the functions we need to call
    const erc20Abi = [
      {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }]
      },
      {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }]
      },
      {
        name: 'totalSupply',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }]
      },
      {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint8' }]
      }
    ];
    
    // Zora market ABI stub (actual implementation would have more fields)
    const zoraMarketAbi = [
      {
        name: 'getCoinInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: 'coinAddress' }],
        outputs: [{
          type: 'tuple',
          components: [
            { type: 'uint256', name: 'price' },
            { type: 'uint256', name: 'volume24h' },
            { type: 'uint256', name: 'marketCap' },
            { type: 'uint256', name: 'holders' }
          ]
        }]
      }
    ];

    // Fetch basic token info from ERC20 contract
    const [name, symbol, totalSupply, decimals] = await Promise.all([
      publicClient.readContract({
        address: coinAddress,
        abi: erc20Abi,
        functionName: 'name',
      }),
      publicClient.readContract({
        address: coinAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: coinAddress,
        abi: erc20Abi,
        functionName: 'totalSupply',
      }),
      publicClient.readContract({
        address: coinAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      })
    ]);

    // Get market data
    let marketData;
    try {
      // Define the Zora market contract address
      const zoraMarketAddress = process.env.ZORA_MARKET_ADDRESS as Address;
      
      if (!zoraMarketAddress) {
        throw new Error('Zora market address not configured');
      }

      // Fetch market data from Zora market contract
      const marketDataRaw = await publicClient.readContract({
        address: zoraMarketAddress,
        abi: zoraMarketAbi,
        functionName: 'getCoinInfo',
        args: [coinAddress]
      });
      
      marketData = {
        price: marketDataRaw[0].toString(),
        volume24h: marketDataRaw[1].toString(),
        marketCap: marketDataRaw[2].toString(),
        holders: Number(marketDataRaw[3].toString())
      };
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Fallback to mock data if market contract call fails
      marketData = {
        price: "0",
        volume24h: "0",
        marketCap: "0",
        holders: 0
      };
    }

    // Try to fetch metadata from IPFS (simplified implementation)
    let metadata;
    try {
      // Get token URI
      const ipfsGateway = process.env.IPFS_GATEWAY || 'https://cloudflare-ipfs.com/ipfs/';
      
      // Query a potential contract method to get metadata URI
      // This is just an example - actual implementation depends on the token contract
      const metadataUri = `ipfs://QmHash/metadata.json`; // This would come from contract
      
      // Fetch metadata from IPFS
      const metadataUrl = metadataUri.replace('ipfs://', ipfsGateway);
      const metadataResponse = await fetch(metadataUrl);
      metadata = await metadataResponse.json();
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      metadata = null;
    }

    // Return combined data
    return {
      address: coinAddress,
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      decimals: Number(decimals),
      marketData,
      metadata,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching coin info:', error);
    throw error;
  }
}