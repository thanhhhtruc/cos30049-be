import { Type } from 'class-transformer';
import { CurrencyDto } from '../currency/currency.dto';
import { PaginationMetadata } from 'src/common/pagination/pagination.dto';
import { TransactionDto } from '../transaction/transaction.dto';

export class WalletDto {
  id: string;
  address: string;
  type: string;

  balance: number;
  currency?: CurrencyDto;
}

export class GetWalletsInput {
  query?: string;
  @Type(() => Number)
  limit?: number;
  @Type(() => Number)
  page?: number;
}

export class GetWalletsOutput {
  wallets: WalletDto[];
  metadata: PaginationMetadata;
}

export class GetWalletDetailsOutput {
  wallet: WalletDto | null;
  recentTransactions: TransactionDto[];
  firstTransaction: TransactionDto | null;
}

export class WalletNetworkNode {
  address: string;
  wallet: WalletDto;
  level: number; // distance from root
  position?: {
    x: number;
    y: number;
  };
  direction?: 'incoming' | 'outgoing' | 'both'; // relationship direction
  parent?: string; // parent node address
}

export class WalletNetworkEdge {
  source: string; // wallet address
  target: string; // wallet address
  direction?: 'incoming' | 'outgoing' | 'both'; // relationship direction
  transactionCount?: number;
  totalTransactionValue?: number;
  totalGasUsed?: number;
}

export class WalletNetwork {
  rootAddress: string;
  nodes: WalletNetworkNode[];
  edges: WalletNetworkEdge[];
}
