/**
 * Safe Ethereum provider utilities
 * Prevents window.ethereum property conflicts
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

/**
 * Safely get the Ethereum provider without modifying window.ethereum
 */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check if ethereum provider exists
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      return null;
    }

    // Return a safe wrapper that doesn't modify the original
    return {
      isMetaMask: ethereum.isMetaMask,
      isCoinbaseWallet: ethereum.isCoinbaseWallet,
      request: ethereum.request.bind(ethereum),
      on: ethereum.on.bind(ethereum),
      removeListener: ethereum.removeListener.bind(ethereum)
    };
  } catch (error) {
    console.warn('Error accessing Ethereum provider:', error);
    return null;
  }
}

/**
 * Check if Ethereum provider is available
 */
export function isEthereumAvailable(): boolean {
  return getEthereumProvider() !== null;
}

/**
 * Get the current Ethereum accounts
 */
export async function getEthereumAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Ethereum provider not available');
  }

  try {
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts || [];
  } catch (error) {
    console.error('Error getting Ethereum accounts:', error);
    return [];
  }
}

/**
 * Request Ethereum account access
 */
export async function requestEthereumAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Ethereum provider not available');
  }

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts || [];
  } catch (error) {
    console.error('Error requesting Ethereum accounts:', error);
    throw error;
  }
}

/**
 * Get the current network chain ID
 */
export async function getChainId(): Promise<string | null> {
  const provider = getEthereumProvider();
  if (!provider) {
    return null;
  }

  try {
    const chainId = await provider.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}