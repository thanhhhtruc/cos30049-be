import { Type } from 'class-transformer';
import { CurrencyDto } from '../currency/currency.dto';
import { PaginationMetadata } from 'src/common/pagination/pagination.dto';

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
