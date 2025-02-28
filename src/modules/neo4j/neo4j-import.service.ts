import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

@Injectable()
export class Neo4jImportService {
  private readonly logger = new Logger(Neo4jImportService.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  
  private async parseCsvFile(filePath: string): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const results: Record<string, string>[] = [];
      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (data: Record<string, string>) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error: Error) => reject(error));
    });
  }

  async importUsers(csvFilePath: string) {
    const users = await this.parseCsvFile(csvFilePath);
    const query = `
      UNWIND $users as user
      CREATE (u:User {
        id: user.id,
        email: user.email,
        normalizedEmail: user.normalizedEmail,
        password: user.password
      })
    `;
    await this.neo4jService.write(query, { users });
    this.logger.log(`Imported ${users.length} users`);
  }

  async importCurrencies(csvFilePath: string) {
    const currencies = await this.parseCsvFile(csvFilePath);
    const query = `
      UNWIND $currencies as currency
      CREATE (c:Currency {
        type: currency.type,
        name: currency.name,
        symbol: currency.symbol
      })
    `;
    await this.neo4jService.write(query, { currencies });
    this.logger.log(`Imported ${currencies.length} currencies`);
  }

  async importWallets(csvFilePath: string) {
    const wallets = await this.parseCsvFile(csvFilePath);
    const query = `
      UNWIND $wallets as wallet
      MATCH (c:Currency {type: wallet.currencyType})
      CREATE (w:Wallet {
        address: wallet.address,
        balance: toFloat(wallet.balance)
      })
      CREATE (w)-[:HAS_CURRENCY]->(c)
    `;
    await this.neo4jService.write(query, { wallets });
    this.logger.log(`Imported ${wallets.length} wallets`);
  }

  async importTransactions(csvFilePath: string) {
    const transactions = await this.parseCsvFile(csvFilePath);
    const query = `
      UNWIND $transactions as tx
      MATCH (source:Wallet {address: tx.sourceAddress})
      MATCH (dest:Wallet {address: tx.destinationAddress})
      CREATE (source)-[:SENT]->(t:Transaction {
        hash: tx.hash,
        value: toFloat(tx.value),
        blockTimestamp: datetime(tx.blockTimestamp)
      })-[:RECEIVED]->(dest)
    `;
    await this.neo4jService.write(query, { transactions });
    this.logger.log(`Imported ${transactions.length} transactions`);
  }

  async importExchangeRates(csvFilePath: string) {
    const rates = await this.parseCsvFile(csvFilePath);
    const query = `
      UNWIND $rates as rate
      MATCH (base:Currency {type: rate.baseCurrency})
      MATCH (quote:Currency {type: rate.quoteCurrency})
      CREATE (base)-[:EXCHANGE_RATE {
        rate: toFloat(rate.rate),
        timestamp: datetime(rate.timestamp)
      }]->(quote)
    `;
    await this.neo4jService.write(query, { rates });
    this.logger.log(`Imported ${rates.length} exchange rates`);
  }

  async clearDatabase() {
    this.logger.log('Clearing database...');
    await this.neo4jService.write('MATCH (n) DETACH DELETE n');
    this.logger.log('Database cleared!');
  }

  async importAll(dataDir: string) {
    try {
      this.logger.log('Starting data import...');
      console.time('Import time');

      await this.clearDatabase();
      
      await this.importUsers(path.join(dataDir, 'users.csv'));
      await this.importCurrencies(path.join(dataDir, 'currencies.csv'));
      await this.importWallets(path.join(dataDir, 'wallets.csv'));
      await this.importTransactions(path.join(dataDir, 'transactions.csv'));
      await this.importExchangeRates(path.join(dataDir, 'exchange_rates.csv'));

      console.timeEnd('Import time');
      this.logger.log('Data import completed successfully!');
    } catch (error) {
      this.logger.error('Data import failed:', error);
      throw error;
    }
  }
}