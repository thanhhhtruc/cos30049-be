import { createZodDto } from 'nestjs-zod';
import { CreateCurrencyInputSchema } from './currency.schema';
import { ExchangeRateDto } from '../exchange-rate/exchange-rate.dto';

export class CurrencyDto {
  id: string;
  symbol: string;
  name: string;
  iconImg: string;
  exchangeRates?: ExchangeRateDto[] | null;
}

export class CreateCurrencyInput extends createZodDto(
  CreateCurrencyInputSchema,
) {}
