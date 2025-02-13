import { Neo4jService } from '../../modules/neo4j/neo4j.service';
import { generateCryptoAddress, randomNumber } from './seeder.util';

export const seedWallets = async (
  neo4jService: Neo4jService,
  maxBalance: number = 1000,
  maxWalletsPerCurrency = 20
) => {
  console.log('💰 Seeding wallets...');
  const result = await neo4jService.read('MATCH (c:Currency) RETURN c');
  const currencies = result.records.map(record => record.get('c').properties);
  let walletCount = 0;

  for (const currency of currencies) {
    for (let i = 0; i < maxWalletsPerCurrency; i++) {
      const address = generateCryptoAddress(currency.symbol);
      const balance = Math.random() * randomNumber(0, maxBalance);
      const type = Math.random() > 0.5 ? 'Contract' : 'EOA';

      await neo4jService.write(`
        MATCH (c:Currency {symbol: $symbol})
        CREATE (w:Wallet {
          address: $address,
          balance: $balance,
          type: $type
        })
        CREATE (w)-[:HAS_CURRENCY]->(c)
      `, {
        symbol: currency.symbol,
        address,
        balance,
        type
      });
      walletCount++;
    }
  }
  console.log(`💰 ${walletCount} wallets seeded!`);
};