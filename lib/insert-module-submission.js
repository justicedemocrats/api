const airtable = require("./airtable");
const db = require("./db");

module.exports = async data => {
  const { submission_data, submission_id, nomination_airtable_id } = data;

  const toCreate = Object.assign({}, submission_data, {
    Nomination: [nomination_airtable_id]
  });

  const airtable_id = await new Promise((resolve, reject) =>
    airtable(data.module_reference).create(toCreate, (err, record) => {
      if (err) {
        console.error(err);
        console.trace();
        return reject(err);
      }
      return resolve(record.id);
    })
  );

  await db("module_submissions")
    .where({ id: submission_id })
    .update({ airtable_id });

  return { db_id: submission_id, airtable_id };
};
