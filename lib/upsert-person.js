const normalizeEmail = require("normalize-email");
const libPhone = require("libphonenumber-js");
const db = require("./db");
const upsertEmail = require("./upsert-email");
const upsertPhone = require("./upsert-phone");
const airtable = require("./airtable");
const _ = require("lodash");

module.exports = async data => {
  const name = data.name;
  const zip = data.zip;

  if (!data.email && !data.number) {
    return await upsertNameOnly(data);
  }

  let email;
  let number;

  try {
    email = normalizeEmail(data.email);
  } catch (ex) {
    email = undefined;
  }

  try {
    number = libPhone.parsePhoneNumber(data.number, "US").number;
  } catch (ex) {
    number = undefined;
  }

  const [emailMatches, phoneMatches] = await Promise.all([
    email
      ? db("people_emails")
          .leftJoin(
            "email_addresses",
            "people_emails.email",
            "=",
            "email_addresses.email"
          )
          .where("email_addresses.email", "=", email)
          .select("person_id")
      : Promise.resolve([]),
    number
      ? db("people_phones")
          .join(
            "phone_numbers",
            "people_phones.number",
            "=",
            "phone_numbers.number"
          )
          .where("phone_numbers.number", "=", number)
          .select("person_id")
      : Promise.resolve([])
  ]);

  let db_id;
  let airtable_id;

  // if both empty, check for a name match, and if not present do
  // a simple insert
  if (emailMatches.length == 0 && phoneMatches.length == 0) {
    const nameMatch = await findByName(name);

    if (nameMatch) {
      db_id = nameMatch.db_id;
      airtable_id = nameMatch.airtable_id;
      await associatePerson({ db_id, airtable_id }, { email, number });
    } else {
      const creation = await createNewPerson(name, email, number, zip);
      airtable_id = creation.airtable_id;
      db_id = creation.db_id;
    }
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
      const creation = await createNewPerson(name, email, number, zip);
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

async function createNewPerson(name, email, number, zip) {
  const insert = Object.assign({ name }, zip ? { zip } : {});
  const person = await db
    .insert(insert)
    .into("people")
    .returning("id");

  const db_id = person[0];
  const airtable_id = await new Promise((resolve, reject) => {
    const toCreate = Object.assign(
      { Name: name, "DB ID": db_id },
      zip ? { Zip: zip } : {}
    );
    airtable("People").create(toCreate, (err, r) => {
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
      db
        .insert({ email: data.email, person_id: db_id })
        .into("people_emails")
        .returning("id")
    );
  }

  if (data.number) {
    db_promises.push(
      db
        .insert({ number: data.number, person_id: db_id })
        .into("people_phones")
        .returning("id")
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
    update.Email = _.uniq(
      (current_person.fields.Emails || []).concat([
        email_upsert_result.airtable_id
      ])
    );
  }

  if (data.number) {
    update["Phone Number"] = _.uniq(
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

async function findByName(name) {
  const match = await db("people")
    .where({ name })
    .select("id", "airtable_id");

  if (match[0] && match[0].id) {
    return {
      db_id: match[0].id,
      airtable_id: match[0].airtable_id
    };
  }

  return undefined;
}

async function upsertNameOnly(data) {
  const match = await findByName(data.name);
  if (match) return match;

  const toInsert = Object.assign(
    { name: data.name },
    data.zip ? { zip: data.zip } : {}
  );
  const insertResults = await db("people")
    .insert(toInsert)
    .returning("id");

  const db_id = insertResults[0];

  const toCreate = Object.assign(
    { Name: data.name, "DB ID": db_id },
    data.zip ? { Zip: data.zip } : {}
  );

  const airtable_record = await new Promise((resolve, reject) => {
    airtable("People").create(toCreate, (err, record) => {
      if (err) {
        console.error(err);
        console.trace();
        return reject(err);
      }
      return resolve(record);
    });
  });

  const airtable_id = airtable_record.id;

  await db("people")
    .where({ id: db_id })
    .update({ airtable_id });

  return { db_id, airtable_id };
}
