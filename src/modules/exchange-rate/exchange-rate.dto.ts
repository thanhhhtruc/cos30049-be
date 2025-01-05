import { CurrencyDto } from '../currency/currency.dto';

export class ExchangeRateDto {
  rate: number;
  updatedAt: Date;
  id: string;

  baseCurrency: CurrencyDto;
  destinationCurrency: CurrencyDto;
}
