const sampleDistrictNomination = require("./sample-data/district-nomination");
const sampleCandidateNomination = require("./sample-data/candidate-nomination");
const request = require("supertest");
const app = require("../app");
const chai = require("chai");
const processDistrictNomination = require("../jobs/process-district-nomination");
const processCandidateNomination = require("../jobs/process-candidate-nomination");
const mailNominator = require("../jobs/mail-nominator");
const processModuleSubmission = require("../jobs/process-module-submission");

const { assert, expect } = chai;

describe("district nomination", () => {
  let nominationId;
  it("should accept a POST and return a nomination id", done => {
    request(app)
      .post("/nominate/district")
      .send(sampleDistrictNomination)
      .end((err, res) => {
        expect(res.body).to.have.property("id");
        nominationId = res.body.id;
        done();
      });
  });

  it("should process the job, returning a nomination with expected attributes", done => {
    processDistrictNomination({ id: nominationId })
      .then(nomination => {
        expect(nomination.id).to.equal(nominationId);

        for (let key of [
          "nominator",
          "airtable_id",
          "state",
          "district",
          "data"
        ]) {
          expect(nomination[key], `${key} is null`).to.not.be.null;
        }

        done();
      })
      .catch(done);
  });

  it("should successfully send the follow up email", done => {
    mailNominator({
      db_id: nominationId,
      to: sampleDistrictNomination["Nominator Email"],
      type: "district",
      ...sampleDistrictNomination
    })
      .then(ok => done())
      .catch(done);
  });
});

describe("candidate nomination", () => {
  let nominationId;
  it("should accept a POST and return a nomination id", done => {
    request(app)
      .post("/nominate/candidate")
      .send(sampleCandidateNomination)
      .end((err, res) => {
        expect(res.body).to.have.property("id");
        nominationId = res.body.id;
        done();
      });
  });

  it("should process the job, returning a nomination with expected attributes", done => {
    processCandidateNomination({ id: nominationId })
      .then(nomination => {
        expect(nomination.id).to.equal(nominationId);

        for (let key of [
          "nominator",
          "airtable_id",
          "state",
          "district",
          "data"
        ]) {
          expect(nomination[key], `${key} is null`).to.not.be.null;
        }

        done();
      })
      .catch(done);
  });

  it("should successfully send the follow up email", done => {
    mailNominator({
      db_id: nominationId,
      to: sampleCandidateNomination["Nominator Email"],
      type: "candidate",
      ...sampleCandidateNomination
    })
      .then(ok => done())
      .catch(done);
  });

  const modules = [
    ["F2M1", "communications-and-messaging"],
    ["F2M2", "field-and-outreach"],
    ["F2M3", "nominee"]
  ];

  modules.forEach(m => {
    let submissionId;
    it(`should successfully return the submission id for ${m[0]}`, done => {
      request(app)
        .post(`/module/${m[0]}`)
        .send(
          Object.assign(require(`./sample-data/${m[1]}`), { id: nominationId })
        )
        .end((err, res) => {
          expect(res.body).to.have.property("id");
          submissionId = res.body.id;
          done();
        });
    });

    it(`should successfully process the submission for ${m[0]}`, done => {
      console.log({ id: submissionId });
      processModuleSubmission({ id: submissionId })
        .then(submission => {
          expect(submission).to.have.property("airtable_id");
          done();
        })
        .catch(done);
    });
  });
});
