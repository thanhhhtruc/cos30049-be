import { generateRandomString } from './seeder.util';

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
