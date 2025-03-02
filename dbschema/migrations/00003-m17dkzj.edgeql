CREATE MIGRATION m17dkzjsq3fygncmjidbde5bazmnr3bpo44tqhawbd74xqtzsq37uq
    ONTO m1sdrvd4mvqsso75rsksxazuzzyqnxqc2chmjc5l4kgxgmak3iucga
{
  ALTER TYPE default::Transaction {
      ALTER PROPERTY value {
          SET TYPE std::bigint USING (<std::bigint>.value);
      };
  };
};
