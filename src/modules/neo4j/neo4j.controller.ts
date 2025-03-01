import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller('api/neo4j')
export class Neo4jController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get('wallets/:address/details')
  async getWalletDetails(@Param('address') address: string) {
    try {
      console.log(`[API Debug] Looking up wallet with address: ${address}`);
      
      // First, normalize the address to lowercase for case-insensitive matching
      const normalizedAddress = address.toLowerCase();
      
      // Check if the wallet exists as either Source or Destination type
      const checkResult = await this.neo4jService.read(`
        MATCH (w)
        WHERE toLower(w.addressId) = $normalizedAddress
        RETURN labels(w) as labels, w.addressId as address
        LIMIT 1
      `, { normalizedAddress });
      
      if (checkResult.records.length === 0) {
        console.log(`[API Debug] No wallet found with address: ${address}`);
        return { 
          wallet: null,
          message: `Address not found in database`,
          debug: { 
            searchedFor: address,
            query: "MATCH (w) WHERE toLower(w.addressId) = $normalizedAddress RETURN w"
          }
        };
      }
      
      // Log what was found
      const nodeLabels = checkResult.records[0].get('labels');
      console.log(`[API Debug] Found node with labels: ${nodeLabels.join(', ')}`);
      
      // Continue with the regular query
      const result = await this.neo4jService.read(`
        MATCH (w)
        WHERE toLower(w.addressId) = $normalizedAddress
        OPTIONAL MATCH (w)-[tx:Transaction]->()
        WITH w, count(tx) as txCount
        RETURN w.addressId as address, labels(w) as type, txCount
      `, { normalizedAddress });

      const record = result.records[0];
      return {
        wallet: {
          address: record.get('address'),
          type: record.get('type')[0] || 'default',
          transactionCount: record.get('txCount').toNumber()
        }
      };
    } catch (error) {
      console.error(`[API Debug] Error in getWalletDetails for ${address}:`, error);
      throw new HttpException(
        {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Database query failed',
          message: error.message,
          details: { address }
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  
  @Get('wallets/:address/neighbors')
  async getWalletNeighbors(@Param('address') address: string) {
    try {
      const [neighborsResult, transactionsResult] = await Promise.all([
        this.neo4jService.read(`
          MATCH (source:Source {addressId: $address})
          MATCH (source)-[tx:Transaction]->(dest:Destination)
          WITH DISTINCT dest, count(tx) as txCount
          RETURN dest.addressId as address, dest.type as type, txCount
          ORDER BY txCount DESC
        `, { address }),
        this.neo4jService.read(`
          MATCH (source:Source {addressId: $address})
          MATCH (source)-[tx:Transaction]->(dest:Destination)
          RETURN tx, dest.addressId as destAddress
          ORDER BY tx.block_timestamp DESC
          LIMIT 50
        `, { address })
      ]);

      const neighbors = neighborsResult.records.map(record => ({
        address: record.get('address'),
        type: record.get('type') || 'default',
        transactionCount: record.get('txCount').toNumber()
      }));

      const transactions = transactionsResult.records.map(record => {
        const tx = record.get('tx').properties;
        return {
          hash: tx.hash,
          value: tx.value || '0',
          sourceAddress: address,
          destinationAddress: record.get('destAddress'),
          blockTimestamp: tx.block_timestamp,
          blockNumber: tx.block_number,
          blockHash: tx.block_hash,
          gas: tx.gas,
          gasUsed: tx.gas_used,
          gasPrice: tx.gas_price,
          transactionFee: tx.transaction_fee
        };
      });

      return { neighbors, transactions };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Database connection failed',
          message: 'Unable to establish connection with Neo4j database'
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

}