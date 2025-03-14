CREATE MIGRATION m1llnaetrp7qih6mqjaumlzwblavhcuzbmjrlsf3zisxskykgua5aq
    ONTO m17dkzjsq3fygncmjidbde5bazmnr3bpo44tqhawbd74xqtzsq37uq
{
  ALTER TYPE default::Transaction {
      ALTER PROPERTY value {
          SET TYPE std::str USING (<std::str>.value);
      };
  };
};
