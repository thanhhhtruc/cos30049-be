import { Injectable, OnModuleInit } from '@nestjs/common';
import { $infer, createClient } from '@dbschema/edgeql-js';
import * as T from '@dbschema/edgeql-js/typesystem';
import e from '@dbschema/edgeql-js';

export default e;

@Injectable()
export class EdgeDBService implements OnModuleInit {
  client = createClient();

  async onModuleInit() {
    await this.client.ensureConnected();
  }

  async query<Expr extends T.Expression>(
    expression: Expr,
  ): Promise<$infer<Expr>> {
    return await expression.run(this.client);
  }
}
