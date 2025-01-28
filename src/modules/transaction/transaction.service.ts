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
    transactionHash,
    dstAddress,
  }: {
    address: string;
    type?: TransactionType;
    limit?: number;
    page?: number;
    transactionHash?: string;
    dstAddress?: string;
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

        const hashFilter = transactionHash
          ? e.op(transaction.hash, 'ilike', `%${transactionHash}%`)
          : e.op(true, '=', true);

        const dstAddressFilter = dstAddress
          ? e.op(
              transaction.destinationWallet.address,
              'ilike',
              `%${dstAddress}%`,
            )
          : e.op(true, '=', true);

        const typeFilter =
          type === TransactionType.INCOMING
            ? isDestinationWallet
            : type === TransactionType.OUTGOING
              ? isSourceWallet
              : bothSourceAndDestination;

        return {
          ...e.Transaction['*'],
          filter: e.all(e.set(typeFilter, hashFilter, dstAddressFilter)),
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

      const hashFilter = transactionHash
        ? e.op(transaction.hash, 'ilike', `%${transactionHash}%`)
        : e.op(true, '=', true);

      const dstAddressFilter = dstAddress
        ? e.op(
            transaction.destinationWallet.address,
            'ilike',
            `%${dstAddress}%`,
          )
        : e.op(true, '=', true);

      const typeFilter =
        type === TransactionType.INCOMING
          ? isDestinationWallet
          : type === TransactionType.OUTGOING
            ? isSourceWallet
            : bothSourceAndDestination;

      return {
        ...e.Transaction['*'],
        sourceWallet: {
          ...e.Transaction.sourceWallet['*'],
        },
        destinationWallet: {
          ...e.Transaction.destinationWallet['*'],
        },
        limit,
        offset: (page - 1) * limit,
        filter: e.all(e.set(typeFilter, hashFilter, dstAddressFilter)),
      };
    });

    const transactions = await this.edgeDBService.query(transactionsQuery);

    return {
      transactions,
      metadata: new PaginationMetadata({ limit, page, total }),
    };
  }
}
