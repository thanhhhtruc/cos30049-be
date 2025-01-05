import { Injectable } from '@nestjs/common';
import e, { EdgeDBService } from '../edgedb/edgedb.service';
import { WalletDto } from './wallet.dto';

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
}
