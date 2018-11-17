const config = require("./config");

const dev = {
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  }
};

module.exports = {
  dev: dev,
  test: dev,
  development: dev,
  staging: {
    client: "postgresql",
    connection: {
      database: "nominations"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      database: config.SQL_DATABASE,
      user: config.SQL_USER,
      password: config.SQL_PASSWORD,
      host: config.SQL_HOST,
      port: config.SQL_PORT,
      ssl: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
