const db = require("./db");
const upsertEmail = require("./upsert-email");
const upsertPhone = require("./upsert-phone");
const _ = require("lodash");

module.exports = async data => {
  const data = { email, number, name };

  const [emailMatches, phoneMatches] = await Promise.all([
    db("email_addresses")
      .where({ email })
      .select("person_id"),
    db("phone_numbers")
      .where({ number })
      .select("person_id")
  ]);

  let db_id;
  let airtable_id;

  // if both empty, simple upsert
  if (emailMatches.length == 0 && phoneMatches.length == 0) {
    airtable_id = await createNewPerson(name, email, number);
  }

  // if email and phone is a person, and they agree
  //  return the airtable id from the db
  // if they disagree, create a new person in the db
  if (emailMatches[0] && phoneMatches[0]) {
    const possible_people_based_on_email = _.uniq(
      emailMatches.map(e => e.person_id)
    );

    const possible_people_based_on_phone = _.uniq(
      phoneMatches.map(p => p.person_id)
    );

    const selection = _.intersection(
      possible_people_based_on_email,
      possible_people_based_on_phone
    )[0];

    if (selection) {
      const record = await db("people").where({ id: selection });
      airtable_id = record.airtable_id;
    } else {
      airtable_id = await createNewPerson(name, email, number);
    }
  }

  // if one empty, set airtable id to the record and associate
  // the new one
  const db_id = emailMatches[0].person_id;
  const record = await db("people").where({ id: db_id });
  airtable_id = record.airtable_id;

  if (emailMatches[0]) {
    await associatePerson({ db_id, airtable_id }, { number });
  } else {
    await associatePerson({ db_id, airtable_id }, { email });
  }

  return { airtable_id };
};

async function createNewPerson(name, email, number) {
  const person = await db.insert({ name }).into("people");
  // TODO - insert into airtable
  const db_id = person.id;
  const airtable_id = "TODO";
  await associatePerson({ db_id, airtable_id }, { number, email });
  return airtable_id;
}

async function associatePerson({ db_id, airtable_id }, data) {
  // associate in db
  const db_promises = [];

  if (data.email) {
    db_promises.push(
      db.insert({ email, person_id: db_id }).into("people_emails")
    );
  }

  if (data.number) {
    db_promises.push(
      db.insert({ number, person_id: db_id }).into("people_phones")
    );
  }

  const current_person_promise = new Promise((resolve, reject) =>
    airtable("People").find(
      airtable_id,
      (err, record) => (err ? reject(err) : resolve(record))
    )
  );

  const [
    email_upsert_result,
    phone_upsert_result,
    current_person
  ] = await Promise.all([
    data.email ? upsertEmail(email) : Promise.resolve(undefined),
    data.phone ? upsertPhone(phone) : Promise.resolve(undefined),
    current_person_promise
  ]);

  const update = {};
  if (data.email) {
    update.Emails = _.uniq(
      current_person.fields.Emails.push(email_upsert_result.airtable_id)
    );
  }

  if (data.number) {
    update["Phone Numbers"] = _.uniq(
      current_person.fields["Phone Numbers"].push(
        phone_upsert_result.airtable_id
      )
    );
  }

  await Promise.all(
    db_promises.concat([
      new Promise((resolve, reject) => {
        airtable("People").update(
          airtable_id,
          update,
          (err, record) => (err ? reject(err) : resolve(record))
        );
      })
    ])
  );

  return airtable_id;
}
