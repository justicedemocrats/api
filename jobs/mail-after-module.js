const snakeCase = require("snake-case");
const mail = require("../lib/mail");
const addNominationFollowUpAttributes = require("../lib/add-nomination-follow-up-attributes");

module.exports = async job => {
  const { to, ...rest } = job;
  const template = "on-submit-module->nominator";

  const data = {};
  Object.keys(rest).forEach(key => {
    data[snakeCase(key)] = rest[key];
  });

  const enhanced = await addNominationFollowUpAttributes(
    Object.assign(data, { id: data.nominationId })
  );

  return await mail.sendTemplate(template, to, data);
};
