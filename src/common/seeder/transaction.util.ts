import { createHash } from 'crypto';
import { TransactionDto } from 'src/modules/transaction/transaction.dto';
import { generateRandomString, randomNumber } from './seeder.util';

// Main function to generate the data
export function generateCryptoTransactionData(
  symbol: string,
  srcAddress: string,
  dstAddress: string,
): Omit<TransactionDto, 'id'> {
  let value: number;
  let gas: number;
  let gasPrice: number;
  let hash: string;
  let data: string;
  let blockHash: string;

  // Random UTC timestamp from 2018 - 2024
  const blockTimestamp = new Date(randomNumber(1514764800000, 1704067200000));
  const hexChars = '0123456789abcdef';

  switch (symbol) {
    case 'BTC':
      value = randomNumber(1, 100) / 1000; // BTC in units of 0.001
      gas = randomNumber(100, 200); // Satoshi per byte fee
      gasPrice = gas * 10 ** -8; //Fee Per byte in BTC
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `0000000${generateRandomString(57, hexChars)}`;
      break;
    case 'ETH':
    case 'USDT':
    case 'MATIC':
      value = randomNumber(1, 100); // In whole numbers
      gas = randomNumber(21000, 200000); // Gas units
      gasPrice = randomNumber(10, 200) * 10 ** 9; // Wei
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha3-256').update(data).digest('hex');
      blockHash = `0x${generateRandomString(64, hexChars)}`;
      break;
    case 'BNB':
      value = randomNumber(1, 100); // In whole numbers
      gas = randomNumber(21000, 200000); // Gas units
      gasPrice = randomNumber(10, 200) * 10 ** 9; // Wei
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha3-256').update(data).digest('hex');
      blockHash = `0x${generateRandomString(64, hexChars)}`;
      break;
    case 'ADA':
      value = randomNumber(1, 100); // In whole numbers
      gas = randomNumber(200000, 500000); // Gas units
      gasPrice = randomNumber(5, 15) * 10 ** -6; // ADA per gas
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('blake2b512').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;
    case 'XRP':
      value = randomNumber(1, 100); // In whole numbers
      gas = 15; // Cost of the transaction
      gasPrice = 0.00001; //Fixed value
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;
    case 'DOGE':
      value = randomNumber(1, 100); // In whole numbers
      gas = randomNumber(10000, 50000);
      gasPrice = randomNumber(1, 5) * 10 ** -8;
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `00000${generateRandomString(59, hexChars)}`;
      break;
    case 'SOL':
      value = randomNumber(1, 100); // In whole numbers
      gas = randomNumber(10000, 50000);
      gasPrice = randomNumber(1, 5) * 10 ** -8;
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;
    case 'DOT':
      value = randomNumber(1, 100); // In whole numbers
      gas = randomNumber(10000, 50000);
      gasPrice = randomNumber(1, 5) * 10 ** -8;
      data = `${srcAddress}:${dstAddress}:${value}:${blockTimestamp.getTime()}`;
      hash = createHash('sha256').update(data).digest('hex');
      blockHash = `${generateRandomString(64, hexChars)}`;
      break;
    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }

  const transactionIndex = randomNumber(1, 1000);
  const gasUsed = Math.floor(gas * (randomNumber(50, 100) / 100)); //Gas used should be less than gas
  const transactionFee = gasUsed * gasPrice; // Native currency
  const blockNumber = randomNumber(1000000, 2000000);

  return {
    value,
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
