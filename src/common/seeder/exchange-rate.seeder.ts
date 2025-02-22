import { map, mapSeries } from 'bluebird';
import e from '@dbschema/edgeql-js';
import { client } from './seeder';
import { exchangeRates } from './exchange-rate.data';

export const seedExchangeRates = async () => {
  console.log(`📈 Seeding exchange rates between cryptos...`);

  const compositeQueries = await map(exchangeRates, async (rate) => {
    const selectBaseCurrencyQuery = e.select(e.Currency, () => ({
      ...e.Currency['*'],
      filter_single: { symbol: rate.baseCurrency },
    }));

    const selectDestinationCurrencyQuery = e.select(e.Currency, () => ({
      ...e.Currency['*'],
      filter_single: { symbol: rate.destinationCurrency },
    }));

    const insertExchangeRateQueryFromBaseToDst = e.insert(e.ExchangeRate, {
      ratio: rate.ratio,
      baseCurrency: selectBaseCurrencyQuery,
      destinationCurrency: selectDestinationCurrencyQuery,
      updatedAt: new Date(),
    });

    const insertExchangeRateQueryFromDstToBase = e.insert(e.ExchangeRate, {
      ratio: 1 / rate.ratio,
      baseCurrency: selectDestinationCurrencyQuery,
      destinationCurrency: selectBaseCurrencyQuery,
      updatedAt: new Date(),
    });

    // If the base currency is the same as the destination currency,
    // we only need to insert one exchange rate
    if (rate.baseCurrency === rate.destinationCurrency) {
      return [insertExchangeRateQueryFromBaseToDst.toEdgeQL()];
    }

    return [
      insertExchangeRateQueryFromBaseToDst.toEdgeQL(),
      insertExchangeRateQueryFromDstToBase.toEdgeQL(),
    ];
  });

  const queries = compositeQueries.flat();

  await client.transaction(async (tx) => {
    return await mapSeries(queries, async (query) => {
      await tx.querySingle(query);
    });
  });

  console.log('📈 Crypto exchange rates seeded!');
};
