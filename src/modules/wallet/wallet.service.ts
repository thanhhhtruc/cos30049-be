import { Injectable } from '@nestjs/common';
import e, { EdgeDBService } from '../edgedb/edgedb.service';
import {
  GetWalletDetailsOutput,
  GetWalletsOutput,
  WalletDto,
  WalletNetworkEdge,
  WalletNetwork,
  WalletNetworkNode,
} from './wallet.dto';
import { TransactionType } from '../transaction/transaction.dto';
import { PaginationMetadata } from 'src/common/pagination/pagination.dto';

@Injectable()
export class WalletService {
  constructor(private readonly edgeDBService: EdgeDBService) {}

  async getWallet({ address }: { address: string }): Promise<WalletDto | null> {
    const walletQuery = e.select(e.Wallet, () => ({
      ...e.Wallet['*'],
      currency: { ...e.Wallet.currency['*'] },
      filter_single: { address },
    }));

    const wallet = await this.edgeDBService.query(walletQuery);

    return wallet;
  }

  async getWalletDetails({
    address,
  }: {
    address: string;
  }): Promise<GetWalletDetailsOutput> {
    const walletQuery = e.select(e.Wallet, () => ({
      ...e.Wallet['*'],
      currency: { ...e.Wallet.currency['*'] },
      filter_single: { address },
    }));

    // Find two most recent transactions
    const twoMostRecenttransactionsQuery = e.select(
      e.Transaction,
      (transaction) => {
        const isSourceWallet = e.op(transaction.sourceWallet, '=', walletQuery);

        const isDestinationWallet = e.op(
          transaction.destinationWallet,
          '=',
          walletQuery,
        );

        return {
          ...e.Transaction['*'],
          sourceWallet: {
            ...e.Transaction.sourceWallet['*'],
          },
          destinationWallet: {
            ...e.Transaction.destinationWallet['*'],
          },
          filter: e.op(isSourceWallet, 'or', isDestinationWallet),
          order_by: {
            expression: transaction.blockTimestamp,
            direction: 'DESC',
          },
          limit: 2,
        };
      },
    );

    // Find the first transaction of the wallet
    const firstTransactionQuery = e
      .select(e.Transaction, (transaction) => {
        const isSourceWallet = e.op(transaction.sourceWallet, '=', walletQuery);

        const isDestinationWallet = e.op(
          transaction.destinationWallet,
          '=',
          walletQuery,
        );

        return {
          ...e.Transaction['*'],
          filter: e.op(isSourceWallet, 'or', isDestinationWallet),
          order_by: {
            expression: transaction.blockTimestamp,
            direction: 'ASC',
          },
          limit: 1,
        };
      })
      .assert_single();

    const wallet = await this.edgeDBService.query(walletQuery);
    const twoMostRecentTransactions = await this.edgeDBService.query(
      twoMostRecenttransactionsQuery,
    );
    const firstTransaction = await this.edgeDBService.query(
      firstTransactionQuery,
    );

    return {
      wallet,
      recentTransactions: twoMostRecentTransactions,
      firstTransaction,
    };
  }

  async getWallets({
    query,
    limit = 10,
    page = 1,
  }: {
    query?: string;
    limit?: number;
    page?: number;
  }): Promise<GetWalletsOutput> {
    const totalResults = e.count(
      e.select(e.Wallet, (wallet) => {
        return {
          filter: query
            ? e.op(wallet.address, 'ilike', `%${query}%`)
            : undefined,
        };
      }),
    );

    const total = await this.edgeDBService.query(totalResults);

    const walletsQuery = e.select(e.Wallet, (wallet) => ({
      ...e.Wallet['*'],
      limit,
      offset: (page - 1) * limit,
      currency: { ...e.Wallet.currency['*'] },
      filter: query ? e.op(wallet.address, 'ilike', `%${query}%`) : undefined,
    }));

    const wallets = await this.edgeDBService.query(walletsQuery);

    return {
      wallets,
      metadata: new PaginationMetadata({ page, limit, total }),
    };
  }

  async getWalletNeighbors({
    address,
    type = TransactionType.ALL,
  }: {
    address: string;
    type?: TransactionType;
  }) {
    const walletQuery = e.select(e.Wallet, () => ({
      ...e.Wallet['*'],
      filter_single: { address },
    }));

    // Get all incoming transactions for the wallet
    const incomingTransactionsQuery = e.select(e.Transaction, (transaction) => {
      const isDestinationWallet = e.op(
        transaction.destinationWallet,
        '=',
        walletQuery,
      );

      return {
        sourceWallet: {
          id: true,
        },
        filter: isDestinationWallet,
      };
    });

    // Get all outgoing transactions for the wallet
    const outgoingTransactionsQuery = e.select(e.Transaction, (transaction) => {
      const isSourceWallet = e.op(transaction.sourceWallet, '=', walletQuery);

      return {
        destinationWallet: {
          id: true,
        },
        filter: isSourceWallet,
      };
    });

    // Get all wallets involved in the (incoming / outgoing / all) transactions

    const involvedWallets =
      type === TransactionType.INCOMING
        ? incomingTransactionsQuery.sourceWallet.id
        : type === TransactionType.OUTGOING
          ? outgoingTransactionsQuery.destinationWallet.id
          : e.op(
              outgoingTransactionsQuery.destinationWallet.id,
              'union',
              incomingTransactionsQuery.sourceWallet.id,
            );

    const walletsQuery = e.op(
      'distinct',
      e.select(e.Wallet, (wallet) => {
        const isWalletInTransaction = e.op(wallet.id, 'in', involvedWallets);

        const isOriginWallet = e.op(wallet.address, '=', address);

        return {
          ...e.Wallet['*'],
          currency: { ...e.Wallet.currency['*'] },
          filter: e.op(
            isWalletInTransaction,
            'and',
            e.op(isOriginWallet, '!=', true),
          ),
        };
      }),
    );

    const wallets = await this.edgeDBService.query(walletsQuery);

    return wallets;
  }

  async getWalletNetwork({
    address,
    depth = 1,
    maxWallets = 100,
    type = TransactionType.OUTGOING,
  }: {
    address: string;
    depth?: number;
    maxWallets?: number;
    type?: TransactionType;
  }): Promise<WalletNetwork> {
    const visited = new Set<string>();
    const nodes: Map<string, WalletNetworkNode> = new Map();
    const edges: WalletNetworkEdge[] = [];

    // Get the root wallet
    const rootWallet = await this.getWallet({ address });
    if (!rootWallet) {
      return { rootAddress: address, nodes: [], edges: [] };
    }

    // Create root node at center position
    nodes.set(address, {
      address,
      wallet: rootWallet,
      level: 0,
      position: { x: 0, y: 0 },
    });

    // Mark root as visited
    visited.add(address);

    // Build a queue for breadth-first traversal
    const queue: { address: string; level: number; parentAddress?: string }[] =
      [
        {
          address,
          level: 0,
        },
      ];

    // Process queue (breadth-first approach)
    let i = 0;
    while (i < queue.length && nodes.size < maxWallets) {
      const { address: currentAddress, level } = queue[i++];
      const currentNode = nodes.get(currentAddress);

      // Skip if current node is undefined (shouldn't happen, but just in case)
      if (!currentNode || !currentNode.position) {
        continue;
      }

      // If we've reached max depth, don't explore further
      if (level >= depth) {
        continue;
      }

      // Get neighbors of current wallet
      const neighbors = await this.getWalletNeighbors({
        address: currentAddress,
        type,
      });

      // Calculate positioning for neighbors
      const totalNeighbors = neighbors.length;
      const radius = 100 * (level + 1); // Increase radius for each level
      const angleStep = (2 * Math.PI) / Math.max(totalNeighbors, 1);

      // Process each neighbor
      for (let j = 0; j < neighbors.length; j++) {
        const neighbor = neighbors[j];

        // Determine direction (incoming/outgoing/both)
        const isIncoming = await this.isIncomingNeighbor(
          currentAddress,
          neighbor.address,
        );
        const isOutgoing = await this.isOutgoingNeighbor(
          currentAddress,
          neighbor.address,
        );
        const direction =
          isIncoming && isOutgoing
            ? 'both'
            : isIncoming
              ? 'incoming'
              : 'outgoing';

        const { transactionCount, totalTransactionValue, totalGasUsed } =
          await this.analyzeTransaction(currentAddress, neighbor.address);

        // Create edge between current wallet and neighbor
        edges.push({
          source: currentAddress,
          target: neighbor.address,
          direction,
          transactionCount,
          totalTransactionValue,
          totalGasUsed,
        });

        // Add neighbor as node if not already in the graph
        if (!nodes.has(neighbor.address) && nodes.size < maxWallets) {
          // Calculate position based on parent node position and relationship
          let angle = j * angleStep;

          // Adjust angle based on direction to group similar types
          if (direction === 'incoming') {
            angle += Math.PI / 4; // Group incoming nodes together
          } else if (direction === 'outgoing') {
            angle -= Math.PI / 4; // Group outgoing nodes together
          }

          // Calculate coordinates
          const x = currentNode.position.x + radius * Math.cos(angle) + 100;
          const y = currentNode.position.y + radius * Math.sin(angle) + 100;

          nodes.set(neighbor.address, {
            address: neighbor.address,
            wallet: neighbor,
            level: level + 1,
            position: { x, y },
            direction,
            parent: currentAddress,
          });

          // Add to queue if not visited
          if (!visited.has(neighbor.address)) {
            visited.add(neighbor.address);
            queue.push({
              address: neighbor.address,
              level: level + 1,
              parentAddress: currentAddress,
            });
          }
        }
      }
    }

    return {
      rootAddress: address,
      nodes: Array.from(nodes.values()),
      edges,
    };
  }

  // Helper method to check if neighbor is an incoming connection
  private async isIncomingNeighbor(
    currentAddress: string,
    neighborAddress: string,
  ): Promise<boolean> {
    const walletQuery = e.select(e.Wallet, () => ({
      filter_single: { address: currentAddress },
    }));

    const incomingQuery = e.select(e.Transaction, (transaction) => {
      const isDestination = e.op(
        transaction.destinationWallet,
        '=',
        walletQuery,
      );
      const isFromNeighbor = e.op(
        transaction.sourceWallet.address,
        '=',
        neighborAddress,
      );

      return {
        filter: e.op(isDestination, 'and', isFromNeighbor),
        limit: 1,
      };
    });

    const results = await this.edgeDBService.query(incomingQuery);
    return results.length > 0;
  }

  // Helper method to check if neighbor is an outgoing connection
  private async isOutgoingNeighbor(
    currentAddress: string,
    neighborAddress: string,
  ): Promise<boolean> {
    const walletQuery = e.select(e.Wallet, () => ({
      filter_single: { address: currentAddress },
    }));

    const outgoingQuery = e.select(e.Transaction, (transaction) => {
      const isSource = e.op(transaction.sourceWallet, '=', walletQuery);
      const isToNeighbor = e.op(
        transaction.destinationWallet.address,
        '=',
        neighborAddress,
      );

      return {
        filter: e.op(isSource, 'and', isToNeighbor),
        limit: 1,
      };
    });

    const results = await this.edgeDBService.query(outgoingQuery);
    return results.length > 0;
  }

  private async analyzeTransaction(
    sourceAddress: string,
    destinationAddress: string,
  ): Promise<{
    transactionCount: number;
    totalTransactionValue: number;
    totalGasUsed: number;
  }> {
    const transactionsQuery = e.select(e.Transaction, (transaction) => {
      const isSource = e.op(
        transaction.sourceWallet.address,
        '=',
        sourceAddress,
      );
      const isDestination = e.op(
        transaction.destinationWallet.address,
        '=',
        destinationAddress,
      );

      return {
        ...e.Transaction['*'],
        filter: e.op(isSource, 'and', isDestination),
      };
    });

    // Get transactions count
    const count = await this.edgeDBService.query(e.count(transactionsQuery));

    // Get all transactions to calculate sum manually
    const transactions = await this.edgeDBService.query(transactionsQuery);

    // Sum the transaction values manually
    let sum = 0;
    let sumUsedGas = 0;

    for (const tx of transactions) {
      // Handle value as either string or bigint
      if (typeof tx.value === 'string') {
        sum += parseFloat(tx.value) || 0;
      } else if (typeof tx.value === 'bigint') {
        sum += Number(tx.value) || 0;
      }

      sumUsedGas += Number(tx.gasUsed);
    }

    return {
      transactionCount: count,
      totalTransactionValue: sum,
      totalGasUsed: sumUsedGas,
    };
  }
}
