const queue = require("../lib/queue");
const insertNomination = require("../lib/insert-nomination");
const db = require("../lib/db");
const crypt = require("../lib/crypt");

const districtKeys = {
  "Nominator Email": "nominatorEmail",
  "Nominator Phone": "nominatorPhone",
  "Nominator Zip": "nominatorZip",
  "Nominator First Name": "nominatorFirst",
  "Nominator Last Name": "nominatorLast",
  "Co-Signers": "cosigners"
};

module.exports = async function({ id }) {
  const queryResults = await db("nominations").where({ id });
  const data = queryResults[0].data;

  const core = {};
  const extra = {};

  for (let key of Object.keys(data)) {
    if (districtKeys[key]) {
      core[districtKeys[key]] = data[key];
    } else if (key == "District") {
      extra["District"] = `${data["District"]}`;
    } else {
      extra[key] = data[key];
    }
  }

  const nominator = {
    number: core.nominatorPhone,
    email: core.nominatorEmail,
    zip: core.nominatorZip,
    name: core.nominatorFirst + " " + core.nominatorLast
  };

  const nomination = extra;
  const nominationId = await insertNomination(id, nomination, nominator);

  const mailable = Object.assign(nomination, {
    "Nominator First Name": core.nominatorFirst,
    "Nominator Last Name": core.nominatorLast
  });

  await queue.enqueue("mail-nominator", {
    type: "district",
    to: nominator.email,
    db_id: id,
    ...mailable
  });

  await queue.enqueue("process-cosigners", {
    nominationId,
    nomination: mailable,
    cosigners: core.cosigners
  });

  return (await db("nominations").where({ id }))[0];
};
