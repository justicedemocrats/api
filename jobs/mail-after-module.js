const snakeCase = require("snake-case");
const mail = require("../lib/mail");
const addNominationFollowUpAttributes = require("../lib/add-nomination-follow-up-attributes");

module.exports = async job => {
  const { to, ...rest } = job;

  const data = {};
  Object.keys(rest).forEach(key => {
    data[snakeCase(key)] = rest[key];
  });

  const enhanced = await addNominationFollowUpAttributes(
    Object.assign(data, { id: job.nomination_id })
  );

  const template = enhanced.done
    ? "on-all-modules-done->submitter"
    : "on-submit-module->nominator";

  return await mail.sendTemplate(template, to, enhanced);
};
