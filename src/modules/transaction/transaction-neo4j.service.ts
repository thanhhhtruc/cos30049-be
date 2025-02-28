import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';

@Injectable()
export class Neo4jTransactionService {
  constructor(private neo4jService: Neo4jService) {}

  async fetchGraphData(address?: string) {
    try {
      const nodesQuery = `
        MATCH (w:Wallet)-[:HAS_CURRENCY]->(c:Currency)
        ${address ? 'WHERE w.address = $address' : ''}
        WITH DISTINCT w, c
        RETURN w, c
        ${!address ? 'LIMIT 50' : ''}
      `;

      const relationshipsQuery = `
        MATCH (w:Wallet ${address ? '{address: $address}' : ''})
        MATCH path=(source:Wallet)-[:SENT]->(tx:Transaction)-[:RECEIVED]->(dest:Wallet)
        WHERE source = w OR dest = w
        WITH source, tx, dest, path
        ORDER BY tx.blockTimestamp DESC
        ${!address ? 'LIMIT 100' : ''}
        WITH COLLECT(path) as paths
        UNWIND paths as p
        WITH DISTINCT relationships(p) as rels, nodes(p) as nodes
        UNWIND rels as rel
        WITH DISTINCT rel as tx, nodes as wallets
        MATCH (source:Wallet)-[:SENT]->(tx)-[:RECEIVED]->(dest:Wallet)
        RETURN source, tx, dest
      `;

    const [nodesResult, relationshipsResult] = await Promise.all([
      this.neo4jService.read(nodesQuery),
      this.neo4jService.read(relationshipsQuery)
    ]);

    const nodes = nodesResult.records.map(record => ({
      id: record.get('w').properties.address,
      address: record.get('w').properties.address,
      type: 'wallet',
      data: {
        address: record.get('w').properties.address,
        balance: record.get('w').properties.balance,
        type: 'wallet',
        currency: {
          type: record.get('c').properties.type,
          symbol: 'ETH',
          iconImg: null
        }
      }
    }));

    const relationships = relationshipsResult.records.map(record => ({
      source: record.get('source').properties.address,
      target: record.get('dest').properties.address,
      value: record.get('tx').properties.value,
      timestamp: record.get('tx').properties.blockTimestamp,
      hash: record.get('tx').properties.hash
    }));

    return { nodes, relationships };
  }
  catch (error) {
      throw error;
    }
  }
}