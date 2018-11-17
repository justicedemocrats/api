const _ = require("lodash");
const config = require("../config");
const airtable = require("../lib/airtable");
const db = require("../lib/db");
const queue = require("../lib/queue");
const crypt = require("../lib/crypt");

module.exports = async function({ nominationId, nomination, cosigners }) {
  if (cosigners && cosigners.length == 0) {
    return "Skipping";
  }

  const nomination_airtable_id = (await db("nominations")
    .where({ id: nominationId })
    .select("airtable_id"))[0].airtable_id;

  const airtable_ids = await Promise.all(
    (cosigners || []).map(
      c =>
        new Promise((resolve, reject) => {
          airtable("Co-Signers").create(
            {
              Nominations: [nomination_airtable_id],
              Email: c.email,
              Name: c.name,
              Zip: c.zip
            },
            (error, record) => {
              if (error) {
                console.error(error);
                console.trace(error);
                return reject(error);
              }
              return resolve(record.id);
            }
          );
        })
    )
  );

  const db_promise = Promise.all(
    (cosigners || []).map((c, idx) =>
      db("cosigners").insert({
        nomination: nominationId,
        email: c.email,
        name: c.name,
        zip: c.zip,
        airtable_id: airtable_ids[idx]
      })
    )
  );

  const cosigner_inserts = await db_promise;
  const cosigner_ids = _.flatMap(cosigner_inserts, i => i);

  await Promise.all(
    (cosigners || []).map((cosigner, idx) =>
      (async () => {
        await queue.enqueue("mail-cosigner", {
          to: cosigner.email,
          confirm_url: `${config.COSIGN_CONFIRM_URL}/${crypt.encrypt(
            cosigner_ids[idx]
          )}`,
          ...nomination
        });
      })()
    )
  );

  return cosigner_ids;
};
