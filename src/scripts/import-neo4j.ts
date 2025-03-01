import { NestFactory } from '@nestjs/core';
import { AppModule } from '../modules/app.module';
import { Neo4jImportService } from '../modules/neo4j/neo4j-import.service';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(Neo4jImportService);

  try {
    const dataDir = path.join(__dirname, '..', 'common', 'data');
    await importService.importAll(dataDir);
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();