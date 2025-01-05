import { Injectable } from '@nestjs/common';
import e, { EdgeDBService } from '../edgedb/edgedb.service';
import { TransactionDto, TransactionType } from './transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private edgeDBService: EdgeDBService) {}

  async getWalletTransactions({
    walletId,
    type = TransactionType.ALL,
  }: {
    walletId: string;
    type?: TransactionType;
  }): Promise<TransactionDto[]> {
    const walletQuery = e.select(e.Wallet, () => ({
      ...e.Wallet['*'],
      filter_single: { address: walletId },
    }));

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
        filter:
          type === TransactionType.INCOMING
            ? isDestinationWallet
            : type === TransactionType.OUTGOING
              ? isSourceWallet
              : bothSourceAndDestination,
      };
    });

    const transactions = await this.edgeDBService.query(transactionsQuery);

    return transactions;
  }
}
