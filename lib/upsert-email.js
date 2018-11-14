const db = require("./db");
const airtable = require("./airtable");
const normalizeEmail = require("normalize-email");

module.exports = async unnormalizedEmail => {
  const email = normalizeEmail(unnormalizedEmail);
  // see status of email in db and airtable
  const dbPromise = db("email_addresses").where({ email });
  const airtablePromise = new Promise((resolve, reject) => {
    airtable("Emails")
      .select({
        maxRecords: 1,
        filterByFormula: `{Email} = '${email}'`
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
      airtable("Emails").create({ Email: email }, (err, r) => {
        if (err) {
          console.error(err);
          console.trace();
          return reject(err);
        }
        return resolve(r.id);
      })
    );
  } else {
    airtable_id = airtableRecord._id;
  }

  // if db record doesn't exist, insert it with airtable_id
  // else, add the airtable id to its db record for lookup next time
  if (!dbRecord) {
    await db.insert({ email, airtable_id }).into("email_addresses");
  } else {
    await db("email_addresses")
      .update({ airtable_id })
      .where({ email });
  }

  return { airtable_id };
};
