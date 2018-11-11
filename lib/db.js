module.exports = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  },
  useNullAsDefault: true
});
