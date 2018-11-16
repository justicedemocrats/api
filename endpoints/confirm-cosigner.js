const queue = require("../lib/queue");
const crypt = require("../lib/crypt");

async function confirm(req, res) {
  const cosignerId = crypt.decrypt(req.params.id);
  await queue.enqueue("confirm-cosigner", { cosignerId });
  return res.json({ id: cosignId });
}

module.exports = confirm;
