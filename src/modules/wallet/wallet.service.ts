import { Injectable } from '@nestjs/common';
import e, { EdgeDBService } from '../edgedb/edgedb.service';
import { GetWalletsOutput, WalletDto } from './wallet.dto';
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
}
