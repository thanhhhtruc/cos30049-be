import { createHash } from 'crypto';
import { TransactionDto } from 'src/modules/transaction/transaction.dto';
import { generateRandomString, randomNumber } from './seeder.util';

// Main function to generate the data
export function generateCryptoTransactionData({
  srcSymbol,
  dstSymbol,
  ratio,
  srcAddress,
  dstAddress,
}: {
  srcSymbol: string;
  dstSymbol: string;
  ratio: number;
  srcAddress: string;
  dstAddress: string;
}): Omit<TransactionDto, 'id'> {
  let value: number;
  let gas: number;
  let gasPrice: number;
  let hash: string;
  let data: string;
  let blockHash: string;
  const hexChars = '0123456789abcdef';
  const blockTimestamp = new Date(randomNumber(1514764800000, 1704067200000));

  switch (srcSymbol) {
    case 'BTC':
      value = randomNumber(1000, 500000) / 100000000; // 0.00001 BTC to 0.005 BTC
      gas = randomNumber(80, 180); // Satoshi per byte (typical range)
      gasPrice = gas * 10 ** -8;
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `0000000000${generateRandomString(59, hexChars)}`;
      break;

    case 'ETH':
      value = randomNumber(10000000000000, 5000000000000000) / 10 ** 18; // 0.01 to 5 ETH
      gas = randomNumber(21000, 300000); // Base 21k for simple transactions
      gasPrice = randomNumber(15, 150) * 10 ** 9; // 15-150 Gwei
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha3-256').update(data).digest('hex');
      blockHash = `0x${generateRandomString(64, hexChars)}`;
      break;

    case 'USDT':
      value = randomNumber(10, 100000); // $10 to $100,000 USDT
      gas = randomNumber(50000, 200000); // ERC-20 transfers require more gas
      gasPrice = randomNumber(20, 100) * 10 ** 9; // 20-100 Gwei
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha3-256').update(data).digest('hex');
      blockHash = `0x${generateRandomString(64, hexChars)}`;
      break;

    case 'BNB':
      value = randomNumber(0.1 * 10 ** 18, 50 * 10 ** 18) / 10 ** 18; // 0.1-50 BNB
      gas = randomNumber(21000, 100000); // BSC gas limits
      gasPrice = randomNumber(3, 15) * 10 ** 9; // 3-15 Gwei
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha3-256').update(data).digest('hex');
      blockHash = `0x${generateRandomString(64, hexChars)}`;
      break;

    case 'ADA':
      value = randomNumber(10, 1000000) / 1000000; // 10-1M Lovelace (0.01-1 ADA)
      gas = 170000; // Cardano uses fixed fees
      gasPrice = 0.17; // Average fee in ADA
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('blake2b512').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;

    case 'XRP':
      value = randomNumber(10, 500000); // 10-500k XRP
      gas = 15; // Fixed XRP transaction cost
      gasPrice = 0.00001; // Fixed fee
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;

    case 'DOGE':
      value = randomNumber(100, 5000000); // 100-5M DOGE
      gas = 1; // Simple fee calculation
      gasPrice = 1; // 1 DOGE fee
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `00000${generateRandomString(59, hexChars)}`;
      break;

    case 'SOL':
      value = randomNumber(0.01 * 10 ** 9, 100 * 10 ** 9) / 10 ** 9; // 0.01-100 SOL
      gas = 1; // Simplified SOL gas
      gasPrice = 0.000005; // Typical SOL fee
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;

    case 'DOT':
      value = randomNumber(0.1 * 10 ** 10, 1000 * 10 ** 10) / 10 ** 10; // 0.1-1000 DOT
      gas = 1;
      gasPrice = 0.01; // Typical DOT fee
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;

    case 'MATIC':
      value = randomNumber(0.1 * 10 ** 18, 1000 * 10 ** 18) / 10 ** 18; // 0.1-1000 MATIC
      gas = randomNumber(50000, 200000); // Polygon gas limits
      gasPrice = randomNumber(1, 10) * 10 ** 9; // 1-10 Gwei (Polygon has low fees)
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha3-256').update(data).digest('hex');
      blockHash = `0x${generateRandomString(64, hexChars)}`;
      break;

    default:
      throw new Error(`Unsupported symbol: ${srcSymbol}`);
  }

  if (srcSymbol !== dstSymbol) {
    const convertedValue = value * ratio;
    data = `${srcAddress}:${dstAddress}:${srcSymbol}:${dstSymbol}:${value}:${convertedValue}:${ratio}:${blockTimestamp.getTime()}`;
    hash = createHash('sha256').update(data).digest('hex');
    blockHash = `X${generateRandomString(63, hexChars)}`;
  }

  const transactionIndex = randomNumber(1, 1000);
  const gasUsed =
    srcSymbol === 'BTC'
      ? Math.floor(gas * (randomNumber(80, 120) / 100))
      : Math.floor(gas * (randomNumber(90, 110) / 100));

  const transactionFee = parseFloat((gasUsed * gasPrice).toFixed(8));
  const blockNumber =
    srcSymbol === 'BTC'
      ? randomNumber(500000, 800000)
      : randomNumber(10000000, 50000000);

  return {
    value: BigInt(value),
    hash,
    input: '0x',
    transactionIndex,
    gas,
    gasUsed,
    gasPrice,
    transactionFee,
    blockNumber,
    blockHash,
    blockTimestamp,
  };
}
