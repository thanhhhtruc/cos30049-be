module default {
  # Users who interact w/ the system
  type User {
    required property email -> str {
        constraint exclusive;
    };

    property normalizedEmail -> str {
      constraint exclusive;
    };
    required property password -> str;
    property firstName -> str;
    property lastName -> str;
    property fullName := .firstName ++ " " ++ .lastName;
    property phone -> str;
    property address -> str;
    property profileImg -> str;
    property refreshToken -> str;
  }

  # currency details
  type Currency {
    required property symbol -> str {
      constraint exclusive;
    };  # e.g., 'ETH', 'BTC'
    required property name -> str {
      constraint exclusive;
    };  # full name like 'Ethereum', 'Bitcoin'
    required property iconImg -> str;     # image url
    multi link exchangeRates := .<baseCurrency[IS ExchangeRate];
  }

  # crypto-to-crypto exchange rates
  type ExchangeRate {
    required property ratio -> float64;  # e.g., 1 ETH = 0.05 BTC
    required baseCurrency: Currency;  # e.g., ETH
    required destinationCurrency: Currency;    # e.g., BTC
    required property updatedAt -> datetime; # when rate was updated

  }

 scalar type WalletType extending enum <EOA, Contract>;

  # transactions n wallets stay same but link to currency
  type Wallet {
    required property address -> str {
        constraint exclusive;
    };
    required property type -> WalletType;
    required property balance -> float64 {
        default := 0.0;
    };

    required currency: Currency;  # currency type of wallet
  }

  type Transaction {
    required property hash -> str {
      constraint exclusive;
    };
    required property value -> str;  # accomodate both bigint and float64
    
    required sourceWallet: Wallet;
    required destinationWallet: Wallet;

    required property input -> str;
    required property transactionIndex -> int64;
    required property gas -> int64;
    required property gasUsed -> int64;
    required property gasPrice -> float64;
    required property transactionFee -> float64;
    required property blockNumber -> int64;
    required property blockHash -> str;
    required property blockTimestamp -> datetime;
  }
}
