import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
