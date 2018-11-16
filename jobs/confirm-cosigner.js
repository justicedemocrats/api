const db = require("../lib/db");
const airtable = require("../lib/airtable");

module.exports = async ({ cosignerId }) => {
  await db("cosigners")
    .where({ id: cosignerId })
    .update({ confirmed: true });

  const matches = await db("cosigners")
    .where({ id: cosignerId })
    .select("airtable_id");

  return await new Promise((resolve, reject) => {
    airtable("Co-Signers").update(
      matches[0].airtable_id,
      { Confirmed: true },
      (error, record) => {
        if (error) {
          console.error(error);
          console.trace();
          return reject(error);
        }
        return resolve(record.id);
      }
    );
  });
};
