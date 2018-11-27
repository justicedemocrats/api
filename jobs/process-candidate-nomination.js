const queue = require("../lib/queue");
const insertNomination = require("../lib/insert-nomination");
const db = require("../lib/db");
const crypt = require("../lib/crypt");
const nameify = require("../lib/nameify");

const candidateKeys = {
  "Nominator Email": "nominatorEmail",
  "Nominator Phone": "nominatorPhone",
  "Nominator Zip": "nominatorZip",
  "Nominator First Name": "nominatorFirst",
  "Nominator Last Name": "nominatorLast",
  "Nominee Email": "nomineeEmail",
  "Nominee Phone": "nomineePhone",
  "Nominee Zip": "nomineeZip",
  "Nominee First Name": "nomineeFirst",
  "Nominee Last Name": "nomineeLast",
  "Co-Signers": "cosigners"
};

module.exports = async function({ id }) {
  const queryResults = await db("nominations").where({ id });
  const data = queryResults[0].data;

  const core = {};
  const extra = {};

  for (let key of Object.keys(data)) {
    if (candidateKeys[key]) {
      core[candidateKeys[key]] = data[key];
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
    name: nameify(core.nominatorFirst, core.nominatorLast)
  };

  const nominee = {
    number: core.nomineePhone,
    email: core.nomineeEmail,
    zip: core.nomineeZip,
    name: nameify(core.nomineeFirst, core.nomineeLast)
  };

  const nomination = extra;
  const nominationId = await insertNomination(
    id,
    nomination,
    nominator,
    nominee
  );

  const mailable = Object.assign(nomination, {
    "Nominee First Name": core.nomineeFirst,
    "Nominee Last Name": core.nomineeLast,
    "Nominator First Name": core.nominatorFirst,
    "Nominator Last Name": core.nominatorLast
  });

  await queue.enqueue("mail-nominator", {
    type: "candidate",
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
