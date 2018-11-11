/*
 * On POST /nominate
 * 1. Write the nomination, and nomination raw, to the db.
 * 2. Push the proces event to Pub/Sub
 */

async function main(req, res) {
  const data = req.body;
  return res.send("OK");
}

module.exports = main;
