import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiGetResponse,
} from 'src/common/decorators/api-response.decorator';
import { WalletDto } from './wallet.dto';
import {
  TransactionDto,
  TransactionType,
} from '../transaction/transaction.dto';
import { TransactionService } from '../transaction/transaction.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get(':address')
  @ApiGetResponse(WalletDto, 'Wallet found')
  @ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR)
  @ApiOperation({ summary: 'Get a wallet based on the input address' })
  async getWallet(@Param('address') address: string) {
    return this.walletService.getWallet({ address });
  }

  @Get(':address/transactions')
  // Adding ApiQuery due to this issue: https://github.com/nestjs/swagger/issues/30
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiGetResponse([TransactionDto], 'Get all transactions for a wallet')
  @ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR)
  @ApiOperation({ summary: 'Get a wallet based on the input address' })
  async getWalletTransactions(
    @Param('address') address: string,
    @Query('type')
    type?: TransactionType,
  ) {
    return this.transactionService.getWalletTransactions({
      address,
      type,
    });
  }

  @Get(':address/neighbors')
  // Adding ApiQuery due to this issue: https://github.com/nestjs/swagger/issues/30
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiGetResponse(
    [WalletDto],
    'Get all wallets that have transactions with the input wallet',
  )
  @ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR)
  @ApiOperation({
    summary: 'Get all wallets that have transactions with the input wallet',
  })
  async getWalletNeighbors(
    @Param('address') address: string,
    @Query('type')
    type?: TransactionType,
  ) {
    return this.walletService.getWalletNeighbors({ address, type });
  }
}
