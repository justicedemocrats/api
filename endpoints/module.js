const queue = require("../lib/queue");
const db = require("../lib/db");

async function main(req, res) {
  const data = req.body;
  const moduleName = req.params.module;
  const insertedId = await writeDummySubmission(moduleName, data);
  await queue.enqueue("process-module-submission", { id: insertedId });
  return res.json({ id: insertedId });
}

async function writeDummySubmission(moduleName, data) {
  const { id, ...submission } = data;
  const insertResults = await db("module_submissions").insert({
    nomination: id,
    module: moduleName,
    data: JSON.stringify(submission)
  });
  return insertResults[0];
}

module.exports = main;
