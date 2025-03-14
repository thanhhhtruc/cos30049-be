import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

import e from '@dbschema/edgeql-js';
import { client } from './seeder';

interface NodeData {
  addressId: string;
  type: string;
}

export async function seedNodesAsWallets() {
  // Read and process CSV file
  const csvFilePath = path.resolve(__dirname, 'csv-data/nodes.csv');

  const processedAddresses = new Set<string>();

  const processFile = async () => {
    const parser = fs.createReadStream(csvFilePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      }),
    );

    for await (const record of parser) {
      const node = record as NodeData;

      // Skip duplicates
      if (processedAddresses.has(node.addressId)) {
        continue;
      }

      processedAddresses.add(node.addressId);

      // Map type to WalletType enum
      const walletType = node.type.toLowerCase() === 'eoa' ? 'EOA' : 'Contract';

      try {
        // Check if wallet exists
        const existingWallet = await e
          .select(e.Wallet, (wallet) => ({
            id: true,
            address: true,
            filter: e.op(wallet.address, '=', node.addressId),
          }))
          .run(client);

        if (existingWallet.length === 0) {
          // Create wallet if it doesn't exist
          await e
            .insert(e.Wallet, {
              address: node.addressId,
              type: walletType,
              currency: e.select(e.Currency, (currency) => ({
                filter_single: e.op(currency.symbol, '=', 'ETH'),
              })),
            })
            .run(client);
          console.log(`Created wallet for address: ${node.addressId}`);
        } else {
          console.log(`Wallet for address ${node.addressId} already exists`);
        }
      } catch (error) {
        console.error(`Error processing wallet ${node.addressId}:`, error);
      }
    }

    console.log(`Total unique addresses processed: ${processedAddresses.size}`);
  };

  try {
    await processFile();
    console.log('Wallets seeding completed');
  } catch (error) {
    console.error('Error processing nodes.csv:', error);
  }
}

interface TransactionData {
  from_address: string;
  to_address: string;
  hash: string;
  value: bigint;
  input: string;
  transaction_index: number;
  gas: number;
  gas_used: number;
  gas_price: number;
  transaction_fee: number;
  block_number: number;
  block_hash: string;
  block_timestamp: number;
}

export async function seedRelationshipsAsTransactions() {
  // Read and process CSV file
  const csvFilePath = path.resolve(__dirname, 'csv-data/relationships.csv');

  const processFile = async () => {
    const parser = fs.createReadStream(csvFilePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      }),
    );

    for await (const record of parser) {
      const transaction = record as TransactionData;

      try {
        // Check if transaction exists
        const existingTransaction = await e
          .select(e.Transaction, (tx) => ({
            id: true,
            hash: true,
            filter: e.op(tx.hash, '=', transaction.hash),
          }))
          .run(client);

        // // Check if from wallet exists
        // const fromWallet = await e
        //   .select(e.Wallet, (wallet) => ({
        //     id: true,
        //     address: true,
        //     filter: e.op(wallet.address, '=', transaction.from_address),
        //   }))
        //   .run(client);

        // // Check if to wallet exists
        // const toWallet = await e
        //   .select(e.Wallet, (wallet) => ({
        //     id: true,
        //     address: true,
        //     filter: e.op(wallet.address, '=', transaction.to_address),
        //   }))
        //   .run(client);

        if (existingTransaction.length === 0) {
          // Create transaction if it doesn't exist
          await e
            .insert(e.Transaction, {
              hash: transaction.hash,
              sourceWallet: e.select(e.Wallet, (wallet) => ({
                filter_single: e.op(
                  wallet.address,
                  '=',
                  transaction.from_address,
                ),
              })),
              destinationWallet: e.select(e.Wallet, (wallet) => ({
                filter_single: e.op(
                  wallet.address,
                  '=',
                  transaction.to_address,
                ),
              })),
              value: transaction.value.toString(),
              input: transaction.input,
              transactionIndex: transaction.transaction_index,
              gas: transaction.gas,
              gasUsed: transaction.gas_used,
              gasPrice: transaction.gas_price,
              transactionFee: transaction.transaction_fee,
              blockNumber: transaction.block_number,
              blockHash: transaction.block_hash,
              blockTimestamp: new Date(transaction.block_timestamp * 1000),
            })
            .run(client);
          console.log(`Created transaction with hash: ${transaction.hash}`);
        } else {
          console.log(
            `Transaction with hash ${transaction.hash} already exists`,
          );
        }
      } catch (error) {
        console.error(
          `Error processing transaction ${transaction.hash}:`,
          error,
        );
      }
    }

    console.log(`Total transactions processed`);
  };

  try {
    await processFile();
    console.log('Transactions seeding completed');
  } catch (error) {
    console.error('Error processing transactions.csv:', error);
  }
}
