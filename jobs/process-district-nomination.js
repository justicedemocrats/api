const queue = require("../lib/queue");
const insertNomination = require("../lib/insert-nomination");
const db = require("../lib/db");

const districtKeys = {
  "Nominator Email": "nominatorEmail",
  "Nominator Phone": "nominatorPhone",
  "Nominator Zip": "nominatorZip",
  "Nominator Name": "nominatorName"
};

module.exports = async function({ id }) {
  const queryResults = await db("nominations").where({ id });
  const data = JSON.parse(queryResults[0].data);

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
    name: core.nominatorName
  };

  const nomination = extra;
  const nominationId = await insertNomination(id, nomination, nominator);

  await queue.enqueue("mail-nominator", {
    type: "district",
    to: nominator.nominatorEmail,
    db_id: id,
    ...nomination
  });

  return (await db("nominations").where({ id }))[0];
};
