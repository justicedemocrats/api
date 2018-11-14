const snakeCase = require("snake-case");
const mail = require("../lib/mail");

module.exports = async job => {
  const { to, ...rest } = job;
  const template = "on-submit-module->nominator";

  const data = {};
  Object.keys(rest).forEach(key => {
    data[snakeCase(key)] = rest[key];
  });

  return await mail.sendTemplate(template, to, data);
};
