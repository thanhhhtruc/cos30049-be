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
    if (!fs.existsSync(filePath)) {
      this.logger.error(`CSV file not found: ${filePath}`);
      throw new Error(`CSV file not found: ${filePath}`);
    }

    try {
      return new Promise((resolve, reject) => {
        const results: Record<string, string>[] = [];
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true, skip_empty_lines: true }))
          .on('data', (data: Record<string, string>) => {
            if (Object.values(data).some(value => value === undefined || value === null)) {
              this.logger.warn('Found row with undefined or null values:', data);
            }
            results.push(data);
          })
          .on('end', () => {
            this.logger.debug(`Successfully parsed ${results.length} rows from ${filePath}`);
            resolve(results);
          })
          .on('error', (error: Error) => {
            this.logger.error(`Error parsing CSV file ${filePath}:`, error);
            reject(error);
          });
      });
    } catch (error) {
      this.logger.error(`Failed to parse CSV file ${filePath}:`, error);
      throw error;
    }
  }

  private async createConstraints() {
    const constraints = [
      'CREATE CONSTRAINT addressId_Source_uniq IF NOT EXISTS FOR (n:Source) REQUIRE (n.addressId) IS UNIQUE',
      'CREATE CONSTRAINT addressId_Destination_uniq IF NOT EXISTS FOR (n:Destination) REQUIRE (n.addressId) IS UNIQUE'
    ];

    for (const constraint of constraints) {
      await this.neo4jService.write(constraint);
    }
    this.logger.log('Created uniqueness constraints');
  }

  async importWallets(csvFilePath: string) {
    await this.createConstraints();
    const wallets = await this.parseCsvFile(csvFilePath);
    
    const sourceQuery = `
      CALL {
        WITH $batch as batch
        UNWIND batch as wallet
        MERGE (n:Source { addressId: wallet.addressId })
        SET n.addressId = wallet.addressId,
            n.type = wallet.type
      } IN TRANSACTIONS OF 10000 ROWS
    `;

    const destQuery = `
      CALL {
        WITH $batch as batch
        UNWIND batch as wallet
        MERGE (n:Destination { addressId: wallet.addressId })
        SET n.addressId = wallet.addressId,
            n.type = wallet.type
      } IN TRANSACTIONS OF 10000 ROWS
    `;

    await this.neo4jService.write(sourceQuery, { batch: wallets });
    await this.neo4jService.write(destQuery, { batch: wallets });
    this.logger.log(`Imported ${wallets.length} wallets as Source and Destination nodes`);
  }

  async importTransactions(csvFilePath: string) {
    const transactions = await this.parseCsvFile(csvFilePath);
    const query = `
      CALL {
        WITH $batch as batch
        UNWIND batch as tx
        MATCH (source:Source { addressId: tx.from_address })
        MATCH (target:Destination { addressId: tx.to_address })
        MERGE (source)-[r:Transaction]->(target)
        SET r.hash = tx.hash,
            r.value = toFloat(trim(tx.value)),
            r.input = tx.input,
            r.transaction_index = toInteger(trim(tx.transaction_index)),
            r.gas = toInteger(trim(tx.gas)),
            r.gas_used = toInteger(trim(tx.gas_used)),
            r.gas_price = toInteger(trim(tx.gas_price)),
            r.transaction_fee = toInteger(trim(tx.transaction_fee)),
            r.block_number = toInteger(trim(tx.block_number)),
            r.block_hash = tx.block_hash,
            r.block_timestamp = toInteger(trim(tx.block_timestamp))
      } IN TRANSACTIONS OF 10000 ROWS
    `;
    await this.neo4jService.write(query, { batch: transactions });
    this.logger.log(`Imported ${transactions.length} transactions`);
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
      
      await this.importWallets(path.join(dataDir, 'nodes.csv'));
      await this.importTransactions(path.join(dataDir, 'relationships.csv'));

      console.timeEnd('Import time');
      this.logger.log('Data import completed successfully!');
    } catch (error) {
      this.logger.error('Data import failed:', error);
      throw error;
    }
  }
}