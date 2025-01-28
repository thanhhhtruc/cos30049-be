import { Injectable } from '@nestjs/common';
import e, { EdgeDBService } from '../edgedb/edgedb.service';
import { GetWalletTransactionsOuput, TransactionType } from './transaction.dto';
import { PaginationMetadata } from 'src/common/pagination/pagination.dto';

@Injectable()
export class TransactionService {
  constructor(private edgeDBService: EdgeDBService) {}

  async getWalletTransactions({
    address,
    type = TransactionType.ALL,
    limit = 10,
    page = 1,
  }: {
    address: string;
    type?: TransactionType;
    limit?: number;
    page?: number;
  }): Promise<GetWalletTransactionsOuput> {
    const walletQuery = e.select(e.Wallet, () => ({
      ...e.Wallet['*'],
      filter_single: { address },
    }));

    const totalTransactions = e.count(
      e.select(e.Transaction, (transaction) => {
        const isSourceWallet = e.op(transaction.sourceWallet, '=', walletQuery);

        const isDestinationWallet = e.op(
          transaction.destinationWallet,
          '=',
          walletQuery,
        );

        const bothSourceAndDestination = e.op(
          isSourceWallet,
          'or',
          isDestinationWallet,
        );

        return {
          filter:
            type === TransactionType.INCOMING
              ? isDestinationWallet
              : type === TransactionType.OUTGOING
                ? isSourceWallet
                : bothSourceAndDestination,
        };
      }),
    );

    const total = await this.edgeDBService.query(totalTransactions);

    const transactionsQuery = e.select(e.Transaction, (transaction) => {
      const isSourceWallet = e.op(transaction.sourceWallet, '=', walletQuery);

      const isDestinationWallet = e.op(
        transaction.destinationWallet,
        '=',
        walletQuery,
      );

      const bothSourceAndDestination = e.op(
        isSourceWallet,
        'or',
        isDestinationWallet,
      );

      return {
        ...e.Transaction['*'],
        limit,
        offset: (page - 1) * limit,
        filter:
          type === TransactionType.INCOMING
            ? isDestinationWallet
            : type === TransactionType.OUTGOING
              ? isSourceWallet
              : bothSourceAndDestination,
      };
    });

    const transactions = await this.edgeDBService.query(transactionsQuery);

    return {
      transactions,
      metadata: new PaginationMetadata({ limit, page, total }),
    };
  }
}
