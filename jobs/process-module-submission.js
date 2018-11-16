const queue = require("../lib/queue");
const insertModuleSubmission = require("../lib/insert-module-submission");
const db = require("../lib/db");

module.exports = async ({ id }) => {
  const queryResult = await db("module_submissions")
    .where({ "module_submissions.id": id })
    .leftJoin(
      "nominations",
      "module_submissions.nomination",
      "=",
      "nominations.id"
    )
    .select(
      "module_submissions.id as submission_id",
      "module_submissions.data as submission_data",
      "module_submissions.module_reference as module_reference",
      "nominations.id as nomination_id",
      "nominations.airtable_id as nomination_airtable_id",
      "nominations.data as nomination_data"
    );

  const submission = queryResult[0];
  submission.submission_data = JSON.parse(submission.submission_data);
  submission.nomination_data = JSON.parse(submission.nomination_data);

  await insertModuleSubmission(submission);

  const nominatorEmail = submission.nomination_data["Nominator Email"];

  await queue.enqueue("mail-after-module", {
    to: nominatorEmail,
    nominationId: id,
    ...submission.submission_data,
    ...submission.nomination_data
  });

  return (await db("module_submissions").where({ id }))[0];
};
