const queue = require("../lib/queue");
const db = require("../lib/db");
/*
 * On POST /nominate
 * 1. Write the nomination raw to the db.
 * 2. Push the proces event to Pub/Sub
 */
async function district(req, res) {
  const data = req.body;
  const nominationId = await writeDummyNomination(data, "district");
  await queue.enqueue("process-district-nomination", { id: nominationId });
  return res.json({ id: nominationId });
}

async function candidate(req, res) {
  const data = req.body;
  const nominationId = await writeDummyNomination(data, "candidate");
  await queue.enqueue("process-candidate-nomination", { id: nominationId });
  return res.json({ id: nominationId });
}

async function writeDummyNomination(data, type) {
  const insertResults = await db("nominations")
    .insert({
      type,
      data: JSON.stringify(data)
    })
    .returning("id");

  return insertResults[0];
}

module.exports = { district, candidate };
