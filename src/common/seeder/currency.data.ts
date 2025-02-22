import { CreateCurrencyInput } from 'src/modules/currency/currency.dto';

export const currencies: CreateCurrencyInput[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    iconImg: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    iconImg: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    iconImg: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    iconImg: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    iconImg: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    iconImg: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    iconImg: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    iconImg: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    iconImg: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    iconImg: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  },
];
