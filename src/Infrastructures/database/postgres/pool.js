/* istanbul ignore file */
const { Pool, types } = require("pg");

// Paksa TIMESTAMP (OID 1114) dianggap UTC (stabil di semua timezone)
types.setTypeParser(1114, (val) => (val === null ? null : new Date(`${val}Z`)));

const config = {
  host: process.env.PGHOST_TEST ?? process.env.PGHOST,
  port: process.env.PGPORT_TEST ?? process.env.PGPORT,
  user: process.env.PGUSER_TEST ?? process.env.PGUSER,
  password: process.env.PGPASSWORD_TEST ?? process.env.PGPASSWORD,
  database: process.env.PGDATABASE_TEST ?? process.env.PGDATABASE,
};

const pool = new Pool(config);

module.exports = pool;
