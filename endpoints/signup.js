const _ = require("lodash");
const moment = require("moment");
const config = require("../config");
const request = require("superagent");

const CHUNK_SIZE = 10;
const NETLIFY_BASE_URL = "https://api.netlify.com/api/v1";
const ACTIONKIT_BASE_URL = config.ACTIONKIT_BASE_URL;
const ACTIONKIT_USERNAME = config.ACTIONKIT_USERNAME;
const ACTIONKIT_PASSWORD = config.ACTIONKIT_PASSWORD;
const ACTIONKIT_SIGNUP_PAGE = "signup-justice-democrats";
const access_token = config.NETLIFY_PERSONAL_ACCESS_TOKEN;
const last_ran = moment().subtract(100, "hours");

async function main(req, res) {
  const {
    body: { akid }
  } = await processSubmission({ data: req.body });
  console.log(`Created or updated ${akid}`);
  return res.json({ akid });
}

async function getAllForms() {
  const resp = await request
    .get(`${NETLIFY_BASE_URL}/forms`)
    .query({ access_token });
  return resp.body;
}

async function getAllSubmissions({ form_id }, last_ran, page, acc) {
  const resp = await request
    .get(`${NETLIFY_BASE_URL}/forms/${form_id}/submissions`)
    .query({ access_token, page });

  const submissions = resp.body;
  const are_submissions_left = submissions.length == 100;

  if (!are_submissions_left) {
    return acc.concat(submissions);
  }

  const submissions_within_time_period = submissions.filter(s =>
    last_ran.isBefore(new Date(s.created_at))
  );

  const need_another_page_fetch =
    submissions_within_time_period.length == submissions.length;

  if (!need_another_page_fetch) {
    return acc.concat(submissions_within_time_period);
  }

  return await getAllSubmissions(
    { form_id },
    last_ran,
    page + 1,
    acc.concat(submissions)
  );
}

async function processSubmissionChunk(chunk) {
  return await Promise.all(chunk.map(processSubmission));
}

async function processSubmission({ data }) {
  const endpoint = `${ACTIONKIT_BASE_URL}/action/`;
  const { name, email, phone } = data;
  return await request
    .post(endpoint)
    .auth(ACTIONKIT_USERNAME, ACTIONKIT_PASSWORD)
    .send({ name, email, phone, page: ACTIONKIT_SIGNUP_PAGE });
}

module.exports = main;
