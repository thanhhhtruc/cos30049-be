import { WalletDto } from '../wallet/wallet.dto';
import { CurrencyDto } from '../currency/currency.dto';
import { Type } from 'class-transformer';
import { PaginationMetadata } from 'src/common/pagination/pagination.dto';

export class TransactionDto {
  id: string;

  value: number;

  hash: string;

  input: string;

  transactionIndex: number;

  gas: number;

  gasUsed: number;

  gasPrice: number;

  transactionFee: number;

  blockNumber: number;

  blockHash: string;

  blockTimestamp: Date;

  sourceWallet?: WalletDto;

  destinationWallet?: WalletDto;

  currency?: CurrencyDto;
}

export enum TransactionType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
  ALL = 'ALL',
}

export enum TransactionOrderBy {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetWalletTransactionsInput {
  type?: TransactionType;
  @Type(() => Number)
  limit?: number;
  @Type(() => Number)
  page?: number;
  transactionHash?: string;
  dstAddress?: string;
  createdAtOrder?: TransactionOrderBy;
}

export class GetWalletTransactionsOuput {
  transactions: TransactionDto[];
  metadata: PaginationMetadata;
}
