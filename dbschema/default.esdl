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
    multi link wallets := .<owner[IS Wallet];
    property refreshToken -> str;
  }

  # currency details
  type Currency {
    required property symbol -> str;  # e.g., 'ETH', 'BTC'
    required property name -> str;    # full name like 'Ethereum', 'Bitcoin'
    required property iconImg -> str;     # image url
    multi link exchangeRates -> CryptoExchangeRate;
  }

  # crypto-to-crypto exchange rates
  type CryptoExchangeRate {
    required property rate -> float64;  # e.g., 1 ETH = 0.05 BTC
    required link baseCurrency -> Currency;  # e.g., ETH
    required link destinationCurrency -> Currency;    # e.g., BTC
    required property updatedAt -> datetime; # when rate was updated
  }

  # transactions n wallets stay same but link to currency
  type Wallet {
    required property address -> str;
    required property type -> str;
    required property balance -> float64 {
        default := 0.0;
    };

    required owner: User;
    required link currency -> Currency;  # currency type of wallet
    multi link transactions -> Transaction {
        createdAt -> datetime {
            default := datetime_current();
        }
    }
    multi link neighbors -> Wallet;
  }

  type Transaction {
    required property hash -> str;
    required property amount -> float64;  # amount in its currency
    required link baseWallet -> Wallet;
    required link destinationWallet -> Wallet;
    required link currency -> Currency;  # currency type of transaction
  }
}
