import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from 'src/modules/neo4j/neo4j.module';
import { SeederService } from './seeder-neo4j.service';
import neo4jConfig from 'src/modules/neo4j/neo4j.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [neo4jConfig],
      isGlobal: true,
    }),
    Neo4jModule.forRoot(),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}