const config = require("../config");
const db = require("./db");
const crypt = require("./crypt");
const _ = require("lodash");

const modules = [
  "nominee",
  "field-and-outreach",
  "communications-and-messaging"
];

module.exports = async nomination => {
  const { id } = nomination;

  const modules_submitted = (await db("module_submissions")
    .where({ nomination: id })
    .select("module_title")).map(m => m.module_title);

  const status_attributes = _.fromPairs(
    modules.map(m => [
      `${m}_not_completed`.replace(/-/g, "_"),
      !modules_submitted.includes(m)
    ])
  );

  const encrypted_nomination_id = crypt.encrypt(id);

  const url_attributes = _.fromPairs(
    modules.map(m => [
      `${m}_url`.replace(/-/g, "_"),
      `${config.MODULE_BASE_URL}/${m}#${encrypted_nomination_id}`
    ])
  );

  return Object.assign({}, nomination, {
    ...status_attributes,
    ...url_attributes
  });
};
