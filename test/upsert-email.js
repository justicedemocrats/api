require("dotenv").config();
const chai = require("chai");
const { assert, expect } = chai;
const faker = require("faker");
const upsertEmail = require("../lib/upsert-email");

describe("upsert email should create and align airtable w/ db", () => {
  const email = "test+" + faker.internet.email();
  let insertedAirtableId = undefined;

  it("should return a airtableId", done => {
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
