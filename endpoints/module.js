const queue = require("../lib/queue");
const db = require("../lib/db");
const crypt = require("../lib/crypt");

async function main(req, res) {
  const data = req.body;
  const moduleName = req.params.module;
  const insertedId = await writeDummySubmission(moduleName, data);
  await queue.enqueue("process-module-submission", { id: insertedId });
  return res.json({ id: insertedId });
}

async function writeDummySubmission(moduleReference, data) {
  const { id, module, ...submission } = data;
  const nomination = crypt.decrypt(id);
  const insertResults = await db("module_submissions").insert({
    nomination: nomination,
    module_reference: moduleReference,
    module_title: data.module,
    data: JSON.stringify(submission)
  });
  return insertResults[0];
}

module.exports = main;
