import { z } from 'zod';

export const CreateCurrencyInputSchema = z.object({
  symbol: z.string().min(1).describe('The symbol of the currency'),
  name: z.string().min(1).describe('The name of the currency'),
  iconImg: z.string().min(1).describe('The icon image of the currency'),
});
