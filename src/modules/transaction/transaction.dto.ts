import { WalletDto } from '../wallet/wallet.dto';
import { CurrencyDto } from '../currency/currency.dto';

export class TransactionDto {
  id: string;

  amount: number;

  hash: string;

  createdAt: Date;

  baseWallet?: WalletDto;

  destinationWallet?: WalletDto;

  currency?: CurrencyDto;
}

export enum TransactionType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
  ALL = 'ALL',
}
