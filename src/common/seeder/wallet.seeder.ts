import e from '@dbschema/edgeql-js';
import { client } from '../seeder/seeder';
import { generateCryptoAddress, randomNumber } from './seeder.util';
import { mapSeries } from 'bluebird';
import { WalletType } from '@dbschema/edgeql-js/modules/default';

export const seedWallets = async (
  maxBalance: number = 1000,
  // Minimum 2 wallets per currency
  // to ensure that we have enough wallets to transact between them
  maxWalletsPerCurrency = 3,
) => {
  const cryptoCurrencies = await e
    .select(e.Currency, () => ({
      ...e.Currency['*'],
    }))
    .run(client);

  console.log(`💰 Seeding wallets...`);

  const insertWalletsQueries = cryptoCurrencies.map((currency) => {
    const insertWalletQueries: string[] = [];
    for (let i = 0; i < maxWalletsPerCurrency; i++) {
      insertWalletQueries.push(
        e
          .insert(e.Wallet, {
            balance: Math.random() * randomNumber(0, maxBalance),
            currency: e.select(e.Currency, () => ({
              ...e.Currency['*'],
              filter_single: { id: currency.id },
            })),
            address: generateCryptoAddress(currency.symbol),
            type: Math.random() > 0.5 ? WalletType.Contract : WalletType.EOA,
          })
          .toEdgeQL(),
      );
    }

    return insertWalletQueries;
  });

  const flattenedWalletsQueries = insertWalletsQueries.flat();

  await client.transaction(async (tx) => {
    return await mapSeries(flattenedWalletsQueries, async (query) => {
      await tx.querySingle(query);
    });
  });

  console.log(`💰 ${flattenedWalletsQueries.length} wallets seeded!`);
};
