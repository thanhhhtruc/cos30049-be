import { Neo4jService } from '../../modules/neo4j/neo4j.service';
import { currencies } from './currency.data';

export const seedCurrencies = async (neo4jService: Neo4jService) => {
  console.log(`💵 Seeding ${currencies.length} currencies...`);
  if (!neo4jService) {
    throw new Error('Neo4jService is not properly injected into seedCurrencies');
  }

  for (const currency of currencies) {
    await neo4jService.write(`
      MERGE (c:Currency {symbol: $symbol})
      ON CREATE SET
        c.name = $name,
        c.iconImg = $iconImg
    `, currency);
  }

  console.log('💵 Currencies seeded!');
};