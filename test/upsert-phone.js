require("dotenv").config();
const chai = require("chai");
const { assert, expect } = chai;
const faker = require("faker");
const upsertPhone = require("../lib/upsert-phone");

describe("upsert phone should create and align airtable w/ db", () => {
  const phone = faker.phone.phoneNumberFormat();
  let insertedAirtableId = undefined;

  it("should return and airtableId", done => {
    upsertPhone(phone).then(result => {
      expect(result.airtable_id).to.be.a("string");
      insertedAirtableId = result.airtable_id;
      done();
    });
  });

  it("shouldnt create a new airtable record for the same phone", done => {
    upsertPhone(phone).then(result => {
      expect(result.airtable_id).to.equal(insertedAirtableId);
      done();
    });
  });
});
