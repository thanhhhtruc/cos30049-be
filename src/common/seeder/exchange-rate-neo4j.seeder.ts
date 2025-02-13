import { Neo4jService } from '../../modules/neo4j/neo4j.service';
import { exchangeRates } from './exchange-rate.data';

export const seedExchangeRates = async (neo4jService: Neo4jService) => {
  console.log('📈 Seeding exchange rates between cryptos...');
  for (const rate of exchangeRates) {
    await neo4jService.write(`
      MATCH (base:Currency {symbol: $baseCurrency})
      MATCH (dest:Currency {symbol: $destinationCurrency})
      CREATE (e:ExchangeRate {
        ratio: $ratio,
        timestamp: datetime()
      })
      CREATE (base)-[:BASE_CURRENCY]->(e)
      CREATE (dest)-[:QUOTE_CURRENCY]->(e)
    `, {
      baseCurrency: rate.baseCurrency,
      destinationCurrency: rate.destinationCurrency,
      ratio: rate.ratio
    });
  }
  console.log('📈 Crypto exchange rates seeded!');
};