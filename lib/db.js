const knex = require("knex");
const config = require("../config");

if (process.env.NODE_ENV === "production") {
  module.exports = knex({
    client: "pg",
    connection: {
      database: "nominations",
      user: config.SQL_USER,
      password: config.SQL_PASSWORD,
      host: config.SQL_HOST,
      ssl: true
    }
  });
} else {
  module.exports = knex({
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    useNullAsDefault: true
  });
}
