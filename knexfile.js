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
      database: "nominations",
      user: config.SQL_USER,
      password: config.SQL_PASSWORD,
      socketPath: `/cloudsql/${config.INSTANCE_CONNECTION_NAME}`
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
