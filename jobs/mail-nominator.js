const snakeCase = require("snake-case");
const mail = require("../lib/mail");

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

  return await mail.sendTemplate(template, to, data);
};
