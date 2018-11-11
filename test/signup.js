const app = require("../app");
const faker = require("faker");
const request = require("supertest");
const chai = require("chai");

const { assert, expect } = chai;

describe("Signup should return an akid", () => {
  const name = faker.name.findName();
  const email = "test@mailinator.com";
  const phone = "5555555555";

  it("should return a 200 with akid: akid", done => {
    request(app)
      .post("/signup")
      .send({ name, email, phone })
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.an("object");
        expect(res.body.akid).to.be.a("string");
        done();
      });
  });
});
