require("dotenv").config();
const chai = require("chai");
const { assert, expect } = chai;
const faker = require("faker");
const upsertPerson = require("../lib/upsert-person");

const postpendTest = email => {
  const [partOne, partTwo] = email.split("@");
  return [partOne + "+test", partTwo].join("@");
};

describe("upsert person should create and align airtable w/ db", () => {
  const email = postpendTest(faker.internet.email());
  const email2 = postpendTest(faker.internet.email());
  const number = faker.phone.phoneNumberFormat();
  const number2 = faker.phone.phoneNumberFormat();
  const name = faker.name.findName();

  it("should return a dbId and airtableId", done => {
    upsertPerson({ email, number, name })
      .then(result => {
        expect(result.airtable_id).to.be.a("string");
        insertedAirtableId = result.airtable_id;
        done();
      })
      .catch(error => {
        console.error(error);
        console.trace();
        done(error);
      });
  });

  it("shouldnt create a new airtable record for the same email", done => {
    upsertPerson({ email, number: number2, name }).then(result => {
      expect(result.airtable_id).to.equal(insertedAirtableId);
      done();
    });
  });

  it("shouldnt create a new airtable record for the same phone", done => {
    upsertPerson({ email: email2, number, name }).then(result => {
      expect(result.airtable_id).to.equal(insertedAirtableId);
      done();
    });
  });

  it("shouldnt create a new airtable record for all matches", done => {
    upsertPerson({ email, number, name }).then(result => {
      expect(result.airtable_id).to.equal(insertedAirtableId);
      done();
    });
  });
});
