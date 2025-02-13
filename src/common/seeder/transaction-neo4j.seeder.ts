import { Neo4jService } from '../../modules/neo4j/neo4j.service';
import { faker } from '@faker-js/faker';
import { generateTransactionHash } from './seeder.util';

export const seedTransactions = async (neo4jService: Neo4jService, transactionCount: number = 1000) => {
  console.log('💸 Seeding transactions...');
  // Get all wallets
  const result = await neo4jService.read(`
    MATCH (w:Wallet)-[:HAS_CURRENCY]->(c:Currency)
    RETURN w, c
  `);

  const wallets = result.records.map(record => ({
    ...record.get('w').properties,
    currency: record.get('c').properties
  }));

  for (let i = 0; i < transactionCount; i++) {
    const sourceWallet = wallets[Math.floor(Math.random() * wallets.length)];
    const destinationWallet = wallets[Math.floor(Math.random() * wallets.length)];

    if (sourceWallet.address !== destinationWallet.address) {
      const amount = faker.number.float({ min: 0.00001, max: 10, fractionDigits: 5 });
      const timestamp = faker.date.past().getTime();
      
      const hash = generateTransactionHash(
        sourceWallet.currency.symbol,
        sourceWallet.address,
        destinationWallet.address,
        amount,
        timestamp
      );

      await neo4jService.write(`
        MATCH (source:Wallet {address: $sourceAddress})
        MATCH (dest:Wallet {address: $destAddress})
        CREATE (t:Transaction {
          hash: $hash,
          amount: $amount,
          timestamp: datetime($timestamp),
          status: 'COMPLETED'
        })
        CREATE (source)-[:SENT]->(t)
        CREATE (t)-[:RECEIVED]->(dest)
      `, {
        sourceAddress: sourceWallet.address,
        destAddress: destinationWallet.address,
        hash,
        amount,
        timestamp: new Date(timestamp).toISOString()
      });
    }
  }
  console.log(`💸 ${transactionCount} transactions seeded!`);
};