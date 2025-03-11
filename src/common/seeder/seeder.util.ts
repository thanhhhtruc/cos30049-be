import { createHash } from 'crypto';

/**
 * Generates a random number between min and max (non-inclusive).
 * @param min - The minimum number.
 * @param max - The maximum number.
 * @returns A random number from min to max.
 */
export const randomNumber = (min: number, max: number): number =>
  Math.random() * (max - min + 1) + min;

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Selects n random elements from an array.
 * @param arr - The array to select from.
 * @param n - The number of elements to select.
 * @returns An array containing n random elements from the input array.
 */
export const randomElementsFromArray = <T>(arr: T[], n: number): T[] => {
  if (n >= arr.length) {
    return arr;
  }
  return arr.sort(() => 0.5 - Math.random()).slice(0, n);
};

// THIS IS ONLY A FAKE IMPLEMENTATION SO THE HASH DATA IS NOT CORRECT
export function generateTransactionHash(
  symbol: string,
  srcAddress: string,
  dstAddress: string,
  amount: number,
  timestamp: number,
): string {
  const data = `${srcAddress}:${dstAddress}:${amount}:${timestamp}`;

  switch (symbol) {
    case 'BTC':
      // Bitcoin (BTC) uses SHA-256 for wallet hash
      return createHash('sha256').update(data).digest('hex');
    case 'ETH':
    case 'USDT':
    case 'MATIC':
      // Ethereum-based (ETH, USDT, MATIC) uses Keccak-256 (SHA-3)
      return createHash('sha3-256').update(data).digest('hex');
    case 'BNB':
      // Binance Coin (BNB) uses Keccak-256 (same as Ethereum)
      return createHash('sha3-256').update(data).digest('hex');
    case 'ADA':
      // Cardano (ADA) uses Blake2b hashing
      return createHash('blake2b512').update(data).digest('hex');
    case 'XRP':
      // XRP uses SHA-256 for wallet hash
      return createHash('sha256').update(data).digest('hex');
    case 'DOGE':
      // Dogecoin (DOGE) uses SHA-256 for wallet hash
      return createHash('sha256').update(data).digest('hex');
    case 'SOL':
      // Solana (SOL) uses SHA-256 for wallet hash
      return createHash('sha256').update(data).digest('hex');
    case 'DOT':
      // Polkadot (DOT) uses SHA-256 for wallet hash
      return createHash('sha256').update(data).digest('hex');
    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
}

export function generateRandomString(length: number, chars: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateCryptoAddress(symbol: string): string {
  switch (symbol) {
    case 'BTC':
      return `1${generateRandomString(33, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    case 'ETH':
    case 'USDT':
    case 'MATIC':
      return `0x${generateRandomString(40, '0123456789abcdef')}`;
    case 'BNB':
      return Math.random() > 0.5
        ? `bnb${generateRandomString(38, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`
        : `0x${generateRandomString(40, '0123456789abcdef')}`;
    case 'ADA':
      return `addr1${generateRandomString(57, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    case 'XRP':
      return `r${generateRandomString(33, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    case 'DOGE':
      return `D${generateRandomString(33, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    case 'SOL':
      return generateRandomString(
        44,
        '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
      );
    case 'DOT':
      return `1${generateRandomString(47, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
}
