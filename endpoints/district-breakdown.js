const db = require("../lib/db");
const knex = require("knex");
const previousCycle = require("./data/2018-breakdown");

async function main(req, res) {
  const hidePreviousCycle = req.query.hidePreviousCycle;

  const breakdown = await db("nominations")
    .select(`state`, `district`)
    .count("*")
    .groupBy("state", "district");

  const breakdownMap = {};
  for (let row of breakdown) {
    breakdownMap[`${row.state}-${row.district}`] = row.count;
  }

  return res.json(
    hidePreviousCycle ? breakdownMap : mapSum(breakdown, previousCycle)
  );
}

module.exports = main;

function mapSum(map1, map2) {
  const result = {};
  const keys = [...new Set(Object.keys(map1).concat(Object.keys(map2)))];
  for (let key of keys) {
    result[key] = (map1[key] || 0) + (map2[key] || 0);
  }
  return result;
}
