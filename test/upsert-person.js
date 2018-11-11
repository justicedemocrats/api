require("dotenv").config();
const chai = require("chai");
const { assert, expect } = chai;
const faker = require("faker");
const upsertPerson = require("../lib/upsert-person");

describe("upsert email should create and align airtable w/ db", () => {
  const email = "test+" + faker.internet.email();
  const email2 = "test+" + faker.internet.email();
  const phone = faker.phone.phoneNumberFormat();
  const phone2 = faker.phone.phoneNumberFormat();
  const name = faker.name.findName();
  const name2 = faker.name.findName();

  it("should return a dbId and airtableId", done => {
    upsertEmail(email).then(result => {
      expect(result.airtable_id).to.be.a("string");
      insertedAirtableId = result.airtable_id;
      done();
    });
  });

  it("shouldnt create a new airtable record for the same email", done => {
    upsertEmail(email).then(result => {
      expect(result.airtable_id).to.equal(insertedAirtableId);
      done();
    });
  });
});
