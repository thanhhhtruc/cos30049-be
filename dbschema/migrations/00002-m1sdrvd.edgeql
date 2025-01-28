CREATE MIGRATION m1sdrvd4mvqsso75rsksxazuzzyqnxqc2chmjc5l4kgxgmak3iucga
    ONTO m1tbdzfbcuoc3tstfgv2yphohulljgdjsotx5y562reuwbin2yshnq
{
  ALTER TYPE default::Transaction {
      ALTER PROPERTY amount {
          RENAME TO value;
      };
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY blockHash: std::str {
          SET REQUIRED USING (<std::str>{});
      };
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY blockNumber: std::int64 {
          SET REQUIRED USING (<std::int64>{});
      };
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY blockTimestamp: std::datetime {
          SET REQUIRED USING (<std::datetime>{});
      };
  };
  ALTER TYPE default::Transaction {
      DROP PROPERTY createdAt;
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY gas: std::int64 {
          SET REQUIRED USING (<std::int64>{});
      };
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY gasPrice: std::float64 {
          SET REQUIRED USING (<std::float64>{});
      };
      CREATE REQUIRED PROPERTY gasUsed: std::int64 {
          SET REQUIRED USING (<std::int64>{});
      };
      CREATE REQUIRED PROPERTY input: std::str {
          SET REQUIRED USING (<std::str>{});
      };
      CREATE REQUIRED PROPERTY transactionFee: std::float64 {
          SET REQUIRED USING (<std::float64>{});
      };
      CREATE REQUIRED PROPERTY transactionIndex: std::int64 {
          SET REQUIRED USING (<std::int64>{});
      };
  };
};
