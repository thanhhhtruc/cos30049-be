import e, { createClient } from '@dbschema/edgeql-js';
import { seedUsers } from './user.seeder';
import { seedCurrencies } from './currency.seeder';
import { seedExchangeRates } from './exchange-rate.seeder';
import { seedWallets } from './wallet.seeder';
import { seedTransactions } from './transaction.seeder';
import {
  seedNodesAsWallets,
  seedRelationshipsAsTransactions,
} from './csv-data.seeder';

export const client = createClient();

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  await e.delete(e.Transaction).run(client);
  await e.delete(e.Wallet).run(client);
  await e.delete(e.User).run(client);
  await e.delete(e.ExchangeRate).run(client);
  await e.delete(e.Currency).run(client);
  console.log('🧹 Database cleared!');
}

async function seed() {
  console.log('EDGEDB Seeding');
  console.log('🌱 Starting seed...');
  console.time('⏱️ Seed time');

  try {
    await clearDatabase();
    await seedUsers();
    await seedCurrencies();
    await seedExchangeRates();
    await seedWallets();
    await seedTransactions();
    await seedNodesAsWallets();
    await seedRelationshipsAsTransactions();

    console.timeEnd('⏱️ Seed time');
    console.log('✅ Seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run the seed
seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });
