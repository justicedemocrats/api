const snakeCase = require("snake-case");
const mail = require("../lib/mail");
const addNominationFollowUpAttributes = require("../lib/add-nomination-follow-up-attributes");

module.exports = async job => {
  const { type, to, ...rest } = job;
  const template = {
    district: "on-submit-district-nomination->nominator",
    candidate: "on-submit-candidate-nomination->nominator"
  }[type];

  const data = {};
  Object.keys(rest).forEach(key => {
    data[snakeCase(key)] = rest[key];
  });

  const enhanced = await addNominationFollowUpAttributes(
    Object.assign(data, { id: data.db_id })
  );

  return await mail.sendTemplate(template, to, enhanced);
};
