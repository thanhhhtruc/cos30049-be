import { Global, Module } from '@nestjs/common';
import { EdgeDBService } from './edgedb.service';

@Global()
@Module({
  providers: [EdgeDBService],
  exports: [EdgeDBService],
})
export class EdgeDBModule {}
