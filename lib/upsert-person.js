const normalizeEmail = require("normalize-email");
const libPhone = require("libphonenumber-js");
const db = require("./db");
const upsertEmail = require("./upsert-email");
const upsertPhone = require("./upsert-phone");
const airtable = require("./airtable");
const _ = require("lodash");

module.exports = async data => {
  const name = data.name;
  const email = normalizeEmail(data.email);
  const number = libPhone.parsePhoneNumber(data.number, "US").number;

  const [emailMatches, phoneMatches] = await Promise.all([
    db("people_emails")
      .leftJoin(
        "email_addresses",
        "people_emails.email",
        "=",
        "email_addresses.email"
      )
      .where("email_addresses.email", "=", email)
      .select("person_id"),
    db("people_phones")
      .join(
        "phone_numbers",
        "people_phones.number",
        "=",
        "phone_numbers.number"
      )
      .where("phone_numbers.number", "=", number)
      .select("person_id")
  ]);

  let db_id;
  let airtable_id;

  // if both empty, simple upsert
  if (emailMatches.length == 0 && phoneMatches.length == 0) {
    const creation = await createNewPerson(name, email, number);
    airtable_id = creation.airtable_id;
    db_id = creation.db_id;
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
      const creation = await createNewPerson(name, email, number);
      airtable_id = creation.airtable_id;
      db_id = creation.db_id;
    }
  }

  // if one empty, set airtable id to the record and associate
  // the new one
  if (emailMatches[0]) {
    db_id = emailMatches[0].person_id;
    const records = await db("people").where({ id: db_id });
    airtable_id = records[0].airtable_id;

    await associatePerson({ db_id, airtable_id }, { number });
  }

  if (phoneMatches[0]) {
    db_id = phoneMatches[0].person_id;
    const records = await db("people").where({ id: db_id });
    airtable_id = records[0].airtable_id;

    await associatePerson({ db_id, airtable_id }, { email });
  }

  return { airtable_id, db_id };
};

async function createNewPerson(name, email, number) {
  const person = await db.insert({ name }).into("people");
  const db_id = person[0];
  const airtable_id = await new Promise((resolve, reject) => {
    airtable("People").create({ Name: name, "DB ID": db_id }, (err, r) => {
      if (err) {
        console.error(err);
        console.trace();
        return reject(err);
      }
      return resolve(r.id);
    });
  });

  await db("people")
    .where({ id: db_id })
    .update({ airtable_id });

  await associatePerson({ db_id, airtable_id }, { number, email });
  return { airtable_id, db_id };
}

async function associatePerson({ db_id, airtable_id }, data) {
  // associate in db
  const db_promises = [];

  if (data.email) {
    db_promises.push(
      db.insert({ email: data.email, person_id: db_id }).into("people_emails")
    );
  }

  if (data.number) {
    db_promises.push(
      db.insert({ number: data.number, person_id: db_id }).into("people_phones")
    );
  }

  const current_person_promise = new Promise((resolve, reject) =>
    airtable("People").find(airtable_id, (err, record) => {
      if (err) {
        console.error(err);
        console.trace();
        return reject(err);
      }
      return resolve(record);
    })
  );

  const [
    email_upsert_result,
    phone_upsert_result,
    current_person
  ] = await Promise.all([
    data.email ? upsertEmail(data.email) : Promise.resolve(undefined),
    data.number ? upsertPhone(data.number) : Promise.resolve(undefined),
    current_person_promise
  ]);

  const update = {};
  if (data.email) {
    update.Emails = _.uniq(
      (current_person.fields.Emails || []).concat([
        email_upsert_result.airtable_id
      ])
    );
  }

  if (data.number) {
    update["Phone Numbers"] = _.uniq(
      (current_person.fields["Phone Numbers"] || []).concat([
        phone_upsert_result.airtable_id
      ])
    );
  }

  await Promise.all(
    db_promises.concat([
      new Promise((resolve, reject) => {
        airtable("People").update(airtable_id, update, (err, record) => {
          if (err) {
            console.error(err);
            console.trace();
            return reject(err);
          }
          return resolve(record);
        });
      })
    ])
  );

  return airtable_id;
}
