import { WalletDto } from '../wallet/wallet.dto';
import { CurrencyDto } from '../currency/currency.dto';

export class TransactionDto {
  id: string;

  amount: number;

  hash: string;

  baseWallet: WalletDto;

  destinationWallet: WalletDto;

  currency: CurrencyDto;
}
