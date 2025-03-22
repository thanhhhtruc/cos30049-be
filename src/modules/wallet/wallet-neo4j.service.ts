import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import {
  WalletDto,
  GetWalletDetailsOutput,
  GetWalletsOutput,
  GetWalletsInput,
} from './wallet.dto';
import { TransactionType } from '../transaction/transaction.dto';
import { PaginationMetadata } from 'src/common/pagination/pagination.dto';

@Injectable()
export class WalletService {
  constructor(private readonly neo4j: Neo4jService) {}

  async getWallet({ address }: { address: string }): Promise<WalletDto | null> {
    const query = `
      MATCH (w:Wallet {address: $address})-[:HAS_CURRENCY]->(c:Currency)
      RETURN w, c
    `;

    const result = await this.neo4j.read(query, { address });
    if (!result.records.length) return null;

    const wallet = result.records[0].get('w').properties;
    const currency = result.records[0].get('c').properties;

    return {
      ...wallet,
      currency,
    };
  }

  async getWalletDetails({
    address,
  }: {
    address: string;
  }): Promise<GetWalletDetailsOutput> {
    const walletQuery = `
      MATCH (w:Wallet {address: $address})-[:HAS_CURRENCY]->(c:Currency)
      RETURN w, c
    `;

    const recentTransactionsQuery = `
      MATCH (w:Wallet {address: $address})
      MATCH (tx:Transaction)
      WHERE (w)-[:SENT]->(tx) OR (tx)-[:RECEIVED]->(w)
      WITH tx, w
      ORDER BY tx.blockTimestamp DESC
      LIMIT 2
      MATCH (source:Wallet)-[:SENT]->(tx)-[:RECEIVED]->(dest:Wallet)
      RETURN tx, source, dest
      ORDER BY tx.blockTimestamp DESC
    `;

    const firstTransactionQuery = `
      MATCH (w:Wallet {address: $address})
      MATCH (tx:Transaction)
      WHERE (w)-[:SENT]->(tx) OR (tx)-[:RECEIVED]->(w)
      WITH tx
      ORDER BY tx.blockTimestamp ASC
      LIMIT 1
      MATCH (source:Wallet)-[:SENT]->(tx)-[:RECEIVED]->(dest:Wallet)
      RETURN tx, source, dest
    `;

    const [walletResult, recentTransactionsResult, firstTransactionResult] =
      await Promise.all([
        this.neo4j.read(walletQuery, { address }),
        this.neo4j.read(recentTransactionsQuery, { address }),
        this.neo4j.read(firstTransactionQuery, { address }),
      ]);

    const wallet = walletResult.records.length
      ? {
          ...walletResult.records[0].get('w').properties,
          currency: walletResult.records[0].get('c').properties,
        }
      : null;

    const recentTransactions = recentTransactionsResult.records.map(
      (record) => ({
        ...record.get('tx').properties,
        sourceWallet: record.get('source').properties,
        destinationWallet: record.get('dest').properties,
      }),
    );

    const firstTransaction = firstTransactionResult.records.length
      ? {
          ...firstTransactionResult.records[0].get('tx').properties,
          sourceWallet:
            firstTransactionResult.records[0].get('source').properties,
          destinationWallet:
            firstTransactionResult.records[0].get('dest').properties,
        }
      : null;

    return {
      wallet,
      recentTransactions,
      firstTransaction,
    };
  }

  async getWallets({
    query,
    limit = 10,
    page = 1,
  }: GetWalletsInput): Promise<GetWalletsOutput> {
    const countQuery = `
      MATCH (w:Wallet)
      ${query ? 'WHERE w.address CONTAINS $query' : ''}
      RETURN count(w) as total
    `;

    const walletsQuery = `
      MATCH (w:Wallet)-[:HAS_CURRENCY]->(c:Currency)
      ${query ? 'WHERE w.address CONTAINS $query' : ''}
      RETURN w, c
      SKIP $skip
      LIMIT $limit
    `;

    const [countResult, walletsResult] = await Promise.all([
      this.neo4j.read(countQuery, { query }),
      this.neo4j.read(walletsQuery, {
        query,
        skip: (page - 1) * limit,
        limit,
      }),
    ]);

    const total = countResult.records[0].get('total').toNumber();

    const wallets = walletsResult.records.map((record) => ({
      ...record.get('w').properties,
      currency: record.get('c').properties,
    }));

    return {
      wallets,
      metadata: new PaginationMetadata({
        page,
        limit,
        total,
      }),
    };
  }

  async getWalletNeighbors({
    address,
    type = TransactionType.ALL,
  }: {
    address: string;
    type?: TransactionType;
  }) {
    let query: string;

    switch (type) {
      case TransactionType.INCOMING:
        query = `
          MATCH (source:Wallet)-[:SENT]->(:Transaction)-[:RECEIVED]->(dest:Wallet {address: $address})
          MATCH (source)-[:HAS_CURRENCY]->(c:Currency)
          RETURN DISTINCT source as wallet, c
        `;
        break;
      case TransactionType.OUTGOING:
        query = `
          MATCH (source:Wallet {address: $address})-[:SENT]->(:Transaction)-[:RECEIVED]->(dest:Wallet)
          MATCH (dest)-[:HAS_CURRENCY]->(c:Currency)
          RETURN DISTINCT dest as wallet, c
        `;
        break;
      default:
        query = `
          MATCH (w:Wallet {address: $address})
          MATCH (neighbor:Wallet)
          WHERE (neighbor)-[:SENT]->(:Transaction)-[:RECEIVED]->(w)
          OR (w)-[:SENT]->(:Transaction)-[:RECEIVED]->(neighbor)
          MATCH (neighbor)-[:HAS_CURRENCY]->(c:Currency)
          RETURN DISTINCT neighbor as wallet, c
        `;
    }

    const result = await this.neo4j.read(query, { address });

    return result.records.map((record) => ({
      ...record.get('wallet').properties,
      currency: record.get('c').properties,
    }));
  }
}
