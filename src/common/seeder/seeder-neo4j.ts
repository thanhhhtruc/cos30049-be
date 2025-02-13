import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeederModule } from './seeder-neo4j.module';
import { SeederService } from './seeder-neo4j.service';

async function bootstrap() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.create(SeederModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Enable all log levels
  });
  
  const seeder = app.get(SeederService);

  try {
    logger.log('Starting seeding process...');
    await seeder.seed();
    logger.log('Seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    process.exit(1);
  } finally {
    logger.log('Closing application...');
    await app.close();
    logger.log('Application closed');
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});