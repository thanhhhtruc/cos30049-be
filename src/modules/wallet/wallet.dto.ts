import { CurrencyDto } from '../currency/currency.dto';

export class WalletDto {
  id: string;
  address: string;
  type: string;

  balance: number;
  currency: CurrencyDto;
}
