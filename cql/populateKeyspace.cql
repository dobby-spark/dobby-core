CREATE KEYSPACE IF NOT EXISTS dobby WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3'}  AND durable_writes = true;

CREATE TABLE IF NOT EXISTS dobby.state_mc (
    botid text,
    topic text,
    intent text,
    state text,
    input text,
    n_intent text,
    n_state text,
    o_msg text,
    PRIMARY KEY ((botid), topic, intent, state, input)
);

COPY dobby.state_mc FROM 'cql/dobby_state_mc.csv';

CREATE TABLE IF NOT EXISTS dobby.botvocab (
    botid text,
    type text,
    name text,
    value text,
    PRIMARY KEY ((botid, type), name, value)
);

COPY dobby.botvocab FROM 'cql/dobby_vocab.csv';

CREATE TABLE IF NOT EXISTS dobby.botvocabtypes (
    botid text PRIMARY KEY,
    input set<text>,
    intent set<text>,
    topic set<text>
);

