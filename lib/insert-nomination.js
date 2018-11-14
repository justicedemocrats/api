const upsertPerson = require("./upsert-person");
const airtable = require("./airtable");
const db = require("./db");

module.exports = async (
  nominationId,
  nomination,
  nominatorData,
  nomineeData
) => {
  const [nominator, nominee] = await Promise.all([
    upsertPerson(nominatorData),
    nomineeData ? upsertPerson(nomineeData) : Promise.resolve(undefined)
  ]);

  const airtableRecord = await new Promise((resolve, reject) =>
    airtable("Nominations").create(
      {
        Nominator: [nominator.airtable_id],
        "DB ID": nominationId,
        Nominee: nominee ? [nominee.airtable_id] : [],
        ...nomination
      },
      (err, record) => {
        if (err) {
          console.error(err);
          console.trace();
        }
        return err ? reject(err) : resolve(record);
      }
    )
  );

  const { State, District } = nomination;
  const update = {
    state: State,
    district: District,
    airtable_id: airtableRecord.id,
    nominator: nominator.db_id,
    ...(nominee ? { nominee: nominee.db_id } : {})
  };

  return await db("nominations")
    .where({ id: nominationId })
    .update(update);
};
