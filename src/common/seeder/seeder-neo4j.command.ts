import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { SeederService } from './seeder-neo4j.service';

@Injectable()
export class SeederCommand {
  private readonly logger = new Logger(SeederCommand.name);

  constructor(private readonly seederService: SeederService) {}

  @Command({
    command: 'seed',
    describe: 'Seed the database with initial data',
  })
  async seed() {
    try {
      this.logger.log('Starting seeding process...');
      await this.seederService.seed();
      this.logger.log('Seeding completed successfully');
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      // Log the full error stack trace for debugging
      if (error instanceof Error) {
        this.logger.error(error.stack);
      }
      process.exit(1);
    }
  }
}