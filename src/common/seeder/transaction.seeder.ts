import e from '@dbschema/edgeql-js';
import { client } from '../seeder/seeder';
import { generateTransactionHash, randomNumber } from './seeder.util';
import { map } from 'bluebird';

export const seedTransactions = async (count: number = 1000) => {
  console.log(`💸 Seeding transactions...`);

  // .map can cause errors since transactions run concurrently and they are interdependent
  // can use .mapSeries to run them sequentially, but it will be slower
  await map(new Array(count).fill(null), async () => {
    await seedTransaction();
  });

  console.log(`💸 ${count} transactions seeded!`);
};

const seedTransaction = async () => {
  const sourceWallet = await e
    .select(e.Wallet, () => ({
      ...e.Wallet['*'],
      currency: {
        id: true,
        symbol: true,
      },
      limit: 1,
      order_by: e.random(),
    }))
    .assert_single()
    .run(client);

  if (!sourceWallet) {
    console.error('No wallet found. Please seed wallets first.');
    return;
  }

  const destinationWallet = await e
    .select(e.Wallet, (wallet) => {
      const isNotSourceWallet = e.op(wallet.id, '!=', e.uuid(sourceWallet.id));
      const isSameCurrency = e.op(
        wallet.currency.id,
        '=',
        e.uuid(sourceWallet.currency.id),
      );

      return {
        ...e.Wallet['*'],
        currency: {
          id: true,
          symbol: true,
        },
        limit: 1,
        order_by: e.random(),
        filter: e.op(isNotSourceWallet, 'and', isSameCurrency),
      };
    })
    .assert_single()
    .run(client);

  if (!destinationWallet) {
    console.error('No wallet found. Please seed wallets first.');
    return;
  }

  const transactedAmount = randomNumber(0, sourceWallet.balance);

  const timestamp = new Date().getUTCMilliseconds();

  const transaction = e.insert(e.Transaction, {
    hash: generateTransactionHash(
      sourceWallet.currency.symbol,
      sourceWallet.address,
      destinationWallet.address,
      transactedAmount,
      timestamp,
    ),
    amount: transactedAmount,
    sourceWallet: e.select(e.Wallet, () => ({
      filter_single: { id: sourceWallet.id },
    })),
    destinationWallet: e.select(e.Wallet, () => ({
      filter_single: { id: destinationWallet.id },
    })),
  });

  const updateSrcWallet = e.update(e.Wallet, () => ({
    filter_single: { id: sourceWallet.id },
    set: {
      balance: sourceWallet.balance - transactedAmount,
    },
  }));

  const updateDstWallet = e.update(e.Wallet, () => ({
    filter_single: { id: destinationWallet.id },
    set: {
      balance: destinationWallet.balance + transactedAmount,
    },
  }));

  await client.transaction(async (tx) => {
    await tx.querySingle(transaction.toEdgeQL());
    // await tx.querySingle(updateSrcWallet.toEdgeQL());
    // await tx.querySingle(updateDstWallet.toEdgeQL());
  });
};
