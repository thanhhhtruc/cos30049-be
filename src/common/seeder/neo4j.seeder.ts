import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../modules/app.module';
import { Neo4jImportService } from '../../modules/neo4j/neo4j-import.service';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(Neo4jImportService);

  try {
    console.log('Importing Neo4j data...');
    const dataDir = path.resolve(__dirname, 'csv-data/');
    await importService.importAll(dataDir);
    console.log('Neo4j data imported successfully');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Importing Neo4j data failed:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
