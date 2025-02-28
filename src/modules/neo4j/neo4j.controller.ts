import { Controller, Get, Param, Query } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller('api/neo4j')
export class Neo4jController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get('nodes')
  async getNodes() {
    const result = await this.neo4jService.read(`
      MATCH (w:Wallet)-[:HAS_CURRENCY]->(c:Currency)
      WITH DISTINCT w, c
      RETURN w, c
      LIMIT 50
    `);

    const nodes = result.records.map(record => ({
      addressId: record.get('w').properties.address,
      type: 'wallet',
      properties: {
        address: record.get('w').properties.address,
        balance: record.get('w').properties.balance,
        currency: {
          type: record.get('c').properties.type,
          symbol: 'ETH'
        }
      }
    }));

    return { nodes };
  }

  @Get('nodes/:address')
  async getNodeDetails(@Param('address') address: string) {
    const result = await this.neo4jService.read(`
      MATCH (w:Wallet {address: $address})-[:HAS_CURRENCY]->(c:Currency)
      WITH w, c,
      size((w)-[:SENT]->()) as sentCount,
      size((w)<-[:RECEIVED]-()) as receivedCount,
      sum((w)-[:SENT]->(tx:Transaction).value) as totalSent,
      sum((w)<-[:RECEIVED]-(tx:Transaction).value) as totalReceived
      RETURN w, c, sentCount, receivedCount, totalSent, totalReceived
    `, { address });

    if (result.records.length === 0) {
      return { node: null };
    }

    const record = result.records[0];
    return {
      node: {
        addressId: record.get('w').properties.address,
        type: 'wallet',
        properties: {
          address: record.get('w').properties.address,
          balance: record.get('w').properties.balance,
          currency: {
            type: record.get('c').properties.type,
            symbol: 'ETH'
          }
        },
        sentTransactionsCount: record.get('sentCount').toNumber(),
        receivedTransactionsCount: record.get('receivedCount').toNumber(),
        totalSent: record.get('totalSent'),
        totalReceived: record.get('totalReceived')
      }
    };
  }

  @Get('nodes/:address/neighbors')
  async getNodeNeighbors(@Param('address') address: string) {
    const [neighborsResult, transactionsResult] = await Promise.all([
      this.neo4jService.read(`
        MATCH (w:Wallet {address: $address})
        MATCH (neighbor:Wallet)
        WHERE (w)-[:SENT]->(:Transaction)-[:RECEIVED]->(neighbor)
           OR (w)<-[:RECEIVED]-(:Transaction)<-[:SENT]-(neighbor)
        RETURN DISTINCT neighbor
      `, { address }),
      this.neo4jService.read(`
        MATCH (w:Wallet {address: $address})
        MATCH (tx:Transaction)
        WHERE (w)-[:SENT]->(tx) OR (w)<-[:RECEIVED]-(tx)
        RETURN tx
        ORDER BY tx.blockTimestamp DESC
        LIMIT 50
      `, { address })
    ]);

    const neighbors = neighborsResult.records.map(record => ({
      addressId: record.get('neighbor').properties.address,
      type: 'wallet',
      properties: {
        address: record.get('neighbor').properties.address,
        balance: record.get('neighbor').properties.balance
      }
    }));

    const transactions = transactionsResult.records.map(record => {
      const tx = record.get('tx').properties;
      return {
        hash: tx.hash,
        value: tx.value,
        sourceAddress: tx.sourceAddress,
        destinationAddress: tx.destinationAddress,
        blockTimestamp: tx.blockTimestamp,
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
        gas: tx.gas,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        transactionFee: tx.transactionFee,
        input: tx.input,
        transactionIndex: tx.transactionIndex
      };
    });

    return { neighbors, transactions };
  }

  @Get('search')
  async searchNode(@Query('address') address: string) {
    const result = await this.neo4jService.read(`
      MATCH (w:Wallet {address: $address})-[:HAS_CURRENCY]->(c:Currency)
      RETURN w, c
    `, { address });

    if (result.records.length === 0) {
      return { node: null };
    }

    const record = result.records[0];
    return {
      node: {
        addressId: record.get('w').properties.address,
        type: 'wallet',
        properties: {
          address: record.get('w').properties.address,
          balance: record.get('w').properties.balance,
          currency: {
            type: record.get('c').properties.type,
            symbol: 'ETH'
          }
        }
      }
    };
  }
}