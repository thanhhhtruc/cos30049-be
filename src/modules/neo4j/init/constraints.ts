// Neo4j Constraints and Indexes Initializer
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j.service';

@Injectable()
export class Neo4jConstraintsInitializer implements OnModuleInit {
  private readonly logger = new Logger(Neo4jConstraintsInitializer.name);

  constructor(private readonly neo4j: Neo4jService) {}

  async onModuleInit() {
    await this.initializeConstraints();
    await this.initializeIndexes();
  }

  private async initializeConstraints() {
    try {
      // User Node Constraints
      await this.neo4j.write(`
        CREATE CONSTRAINT user_id_unique IF NOT EXISTS 
        FOR (u:User) REQUIRE u.id IS UNIQUE
      `);
      
      await this.neo4j.write(`
        CREATE CONSTRAINT user_email_unique IF NOT EXISTS 
        FOR (u:User) REQUIRE u.normalizedEmail IS UNIQUE
      `);

      await this.neo4j.write(`
        CREATE CONSTRAINT user_name_not_null IF NOT EXISTS
        FOR (u:User) REQUIRE u.firstName IS NOT NULL
      `);

      await this.neo4j.write(`
        CREATE CONSTRAINT user_lastname_not_null IF NOT EXISTS
        FOR (u:User) REQUIRE u.lastName IS NOT NULL
      `);

      // Wallet Node Constraints
      await this.neo4j.write(`
        CREATE CONSTRAINT wallet_address_unique IF NOT EXISTS 
        FOR (w:Wallet) REQUIRE w.address IS UNIQUE
      `);
      
      await this.neo4j.write(`
        CREATE CONSTRAINT wallet_id_unique IF NOT EXISTS 
        FOR (w:Wallet) REQUIRE w.id IS UNIQUE
      `);

      // Transaction Node Constraints
      await this.neo4j.write(`
        CREATE CONSTRAINT transaction_hash_unique IF NOT EXISTS 
        FOR (t:Transaction) REQUIRE t.hash IS UNIQUE
      `);

      // Currency Node Constraints
      await this.neo4j.write(`
        CREATE CONSTRAINT currency_symbol_unique IF NOT EXISTS 
        FOR (c:Currency) REQUIRE c.symbol IS UNIQUE
      `);

      this.logger.log('Neo4j constraints initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Neo4j constraints:', error);
      throw error;
    }
  }

  private async initializeIndexes() {
    try {
      // Add indexes here if needed
      this.logger.log('Neo4j indexes initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Neo4j indexes:', error);
      throw error;
    }
  }
}