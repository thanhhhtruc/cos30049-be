CREATE MIGRATION m1k3rergqu2opfyzq5sj6muu37zy2lflvqvczbye4owryuhrql6hza
    ONTO initial
{
  CREATE TYPE default::CryptoExchangeRate {
      CREATE REQUIRED PROPERTY rate: std::float64;
      CREATE REQUIRED PROPERTY updatedAt: std::datetime;
  };
  CREATE TYPE default::Currency {
      CREATE MULTI LINK exchangeRates: default::CryptoExchangeRate;
      CREATE REQUIRED PROPERTY iconImg: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY symbol: std::str;
  };
  ALTER TYPE default::CryptoExchangeRate {
      CREATE REQUIRED LINK baseCurrency: default::Currency;
      CREATE REQUIRED LINK destinationCurrency: default::Currency;
  };
  CREATE TYPE default::Transaction {
      CREATE REQUIRED LINK currency: default::Currency;
      CREATE REQUIRED PROPERTY amount: std::float64;
      CREATE REQUIRED PROPERTY hash: std::str;
  };
  CREATE TYPE default::Wallet {
      CREATE REQUIRED LINK currency: default::Currency;
      CREATE MULTI LINK transactions: default::Transaction {
          CREATE PROPERTY createdAt: std::datetime {
              SET default := (std::datetime_current());
          };
      };
      CREATE MULTI LINK neighbors: default::Wallet;
      CREATE REQUIRED PROPERTY address: std::str;
      CREATE REQUIRED PROPERTY balance: std::float64 {
          SET default := 0.0;
      };
      CREATE REQUIRED PROPERTY type: std::str;
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED LINK baseWallet: default::Wallet;
      CREATE REQUIRED LINK destinationWallet: default::Wallet;
  };
  CREATE TYPE default::User {
      CREATE PROPERTY address: std::str;
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY firstName: std::str;
      CREATE PROPERTY lastName: std::str;
      CREATE PROPERTY fullName := (((.firstName ++ ' ') ++ .lastName));
      CREATE PROPERTY normalizedEmail: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY password: std::str;
      CREATE PROPERTY phone: std::str;
      CREATE PROPERTY profileImg: std::str;
      CREATE PROPERTY refreshToken: std::str;
  };
  ALTER TYPE default::Wallet {
      CREATE REQUIRED LINK owner: default::User;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK wallets := (.<owner[IS default::Wallet]);
  };
};
