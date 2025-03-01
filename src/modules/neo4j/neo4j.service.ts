import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, QueryResult, ManagedTransaction, Config } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly driver: Driver;
  private readonly logger = new Logger(Neo4jService.name);

  constructor(private readonly configService: ConfigService) {
    const uri = this.configService.get<string>('NEO4J_URI');
    const username = this.configService.get<string>('NEO4J_USERNAME') || 'neo4j';
    const password = this.configService.get<string>('NEO4J_PASSWORD') || '';
    
    const config: Config = {
      maxTransactionRetryTime: 60000,
      maxConnectionPoolSize: 50,
      connectionTimeout: 60000,
      connectionAcquisitionTimeout: 30000,
      maxConnectionLifetime: 60 * 60 * 1000, // 1 hour
      logging: {
        level: 'info',
        logger: (level, message) => this.logger.log(`[Neo4j] ${level}: ${message}`)
      }
    };
    

    if (!uri || !password) {
      throw new Error('Neo4j connection details are not properly configured. Please check your environment variables.');
    }

    try {
      this.driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
        config
      );
      this.verifyConnectivity();
      this.logger.log(`Neo4j connection established to ${uri}`);
    } catch (error) {
      this.logger.error('Failed to create Neo4j driver:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.driver?.close();
      this.logger.log('Neo4j connection closed');
    } catch (error) {
      this.logger.error('Error closing Neo4j connection:', error);
      throw error;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }

  private async verifyConnectivity(retries = 5, delay = 2000): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.driver.verifyConnectivity();
        return;
      } catch (error) {
        this.logger.warn(`Connection attempt ${i + 1} failed: ${error.message}`);
        if (i === retries - 1) {
          this.logger.error(`All connection attempts failed after ${retries} retries`, error);
          throw new Error(`Neo4j connection failed: ${error.message}`);
        }
        this.logger.warn(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async read(
    query: string,
    parameters?: Record<string, any>
  ): Promise<QueryResult> {
    const session: Session = this.driver.session({
      database: this.configService.get<string>('neo4j.database') || 'neo4j',
      defaultAccessMode: neo4j.session.READ,
    });

    try {
      await this.verifyConnectivity();
      const result = await session.run(query, parameters);
      return result;
    } catch (error) {
      this.logger.error(`Error executing read query: ${query}`, error);
      throw new Error('Database connection failed: ' + error.message);
    } finally {
      await session.close();
    }
  }

  async write(
    query: string,
    parameters?: Record<string, any>
  ): Promise<QueryResult> {
    const session: Session = this.driver.session({
      database: this.configService.get<string>('neo4j.database') || 'neo4j',
      defaultAccessMode: neo4j.session.WRITE,
    });

    try {
      await this.verifyConnectivity();
      const result = await session.run(query, parameters);
      return result;
    } catch (error) {
      this.logger.error(`Error executing write query: ${query}`, error);
      throw new Error('Database connection failed: ' + error.message);
    } finally {
      await session.close();
    }
  }

  async executeTransaction(
    transactionWork: (tx: ManagedTransaction) => Promise<any>
  ): Promise<any> {
    const session = this.driver.session({
      database: this.configService.get<string>('neo4j.database') || 'neo4j'
    });
    try {
      const result = await session.executeWrite(transactionWork);
      // Remove or change this log level to reduce verbosity
      // this.logger.debug('Transaction executed successfully');
      return result;
    } catch (error) {
      this.logger.error('Error executing transaction:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  
}