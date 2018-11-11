const db = require("./db");
const airtable = require("./airtable");

module.exports = async number => {
  // see status of phone in db and airtable
  const dbPromise = db("phone_numbers").where({ number });
  const airtablePromise = new Promise((resolve, reject) => {
    airtable("Phone Numbers")
      .select({
        maxRecords: 1,
        filterByFormula: `{Number} = '${number}'`
      })
      .eachPage(
        function handleRecords(records) {
          return resolve(records[0]);
        },
        function done(err) {
          console.log("Done! (never called)");
        }
      );
  });

  const dbRecord = (await dbPromise)[0];

  // don't insert into airtable if it already exists
  if (dbRecord && dbRecord.airtable_id) {
    return { airtable_id: dbRecord.airtable_id };
  }

  const airtableRecord = await airtablePromise;

  let airtable_id;
  if (!airtableRecord) {
    airtable_id = await new Promise((resolve, reject) =>
      airtable("Phone Numbers").create({ Number: number }, (err, r) => {
        return err ? reject(err) : resolve(r.id);
      })
    );
  } else {
    airtable_id = airtableRecord._id;
  }

  // if db record doesn't exist, insert it with airtable_id
  // else, add the airtable id to its db record for lookup next time
  if (!dbRecord) {
    await db.insert({ number, airtable_id }).into("phone_numbers");
  } else {
    await db("phone_numbers")
      .update({ airtable_id })
      .where({ number });
  }

  return { airtable_id };
};
