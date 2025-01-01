import e, { createClient } from '@dbschema/edgeql-js';
import { seedUsers } from './user.seeder';

export const client = createClient();

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  await e.delete(e.User).run(client);
  await e.delete(e.Wallet).run(client);
  await e.delete(e.Transaction).run(client);
  await e.delete(e.CryptoExchangeRate).run(client);
  await e.delete(e.Currency).run(client);
  console.log('🧹 Database cleared!');
}

async function seed() {
  console.log('🌱 Starting seed...');
  console.time('⏱ Seed time');

  try {
    await clearDatabase();
    await seedUsers();

    console.timeEnd('⏱ Seed time');
    console.log('✅ Seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run the seed
seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
