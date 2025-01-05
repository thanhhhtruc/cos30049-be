CREATE MIGRATION m1tbdzfbcuoc3tstfgv2yphohulljgdjsotx5y562reuwbin2yshnq
    ONTO initial
{
  CREATE TYPE default::Currency {
      CREATE REQUIRED PROPERTY iconImg: std::str;
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY symbol: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::ExchangeRate {
      CREATE REQUIRED LINK baseCurrency: default::Currency;
      CREATE REQUIRED LINK destinationCurrency: default::Currency;
      CREATE REQUIRED PROPERTY ratio: std::float64;
      CREATE REQUIRED PROPERTY updatedAt: std::datetime;
  };
  ALTER TYPE default::Currency {
      CREATE MULTI LINK exchangeRates := (.<baseCurrency[IS default::ExchangeRate]);
  };
  CREATE SCALAR TYPE default::WalletType EXTENDING enum<EOA, Contract>;
  CREATE TYPE default::Wallet {
      CREATE REQUIRED LINK currency: default::Currency;
      CREATE REQUIRED PROPERTY address: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY balance: std::float64 {
          SET default := 0.0;
      };
      CREATE REQUIRED PROPERTY type: default::WalletType;
  };
  CREATE TYPE default::Transaction {
      CREATE REQUIRED LINK destinationWallet: default::Wallet;
      CREATE REQUIRED LINK sourceWallet: default::Wallet;
      CREATE REQUIRED PROPERTY amount: std::float64;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY hash: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
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
};
