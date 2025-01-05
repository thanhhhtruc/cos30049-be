import { map, mapSeries } from 'bluebird';
import { currencies } from './currency.data';
import e from '@dbschema/edgeql-js';
import { client } from './seeder';

export const seedCurrencies = async () => {
  console.log(`💵 Seeding ${currencies.length} currencies...`);

  const queries = await map(currencies, async (currency) => {
    const insertCurrencyQuery = e.insert(e.Currency, {
      ...currency,
    });

    return insertCurrencyQuery.toEdgeQL();
  });

  await client.transaction(async (tx) => {
    return await mapSeries(queries, async (query) => {
      await tx.querySingle(query);
    });
  });

  console.log('💵 Currencies seeded!');
};
