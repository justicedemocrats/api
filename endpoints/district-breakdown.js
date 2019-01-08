const db = require("../lib/db");
const knex = require("knex");

async function main(req, res) {
  const breakdown = await db("nominations")
    .select(`state`, `district`)
    .count("*")
    .groupBy("state", "district");

  return res.json(breakdown);
}

module.exports = main;
