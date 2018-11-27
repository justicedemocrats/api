const fs = require("fs");
const db = require("../lib/db");
const addNominationFollowUpAttributes = require("../lib/add-nomination-follow-up-attributes");

async function main() {
  const rows = [];
  const noms = await db("nominations").select("id", "data");

  for (let nom of noms) {
    const row = [
      nom.id,
      nom.data["Nominator Email"],
      nom.data["Nominator First Name"],
      nom.data["Nominator Last Name"]
    ];
    const extra_info = await addNominationFollowUpAttributes(nom);
    for (let attr of "nominee_url field_and_outreach_url communications_and_messaging_url".split(
      " "
    )) {
      row.push(extra_info[attr]);
    }
    rows.push(row);
  }

  const output = rows.map(r => r.join(",")).join("\n");
  fs.writeFileSync("./output.csv", output);

  return "done";
}

main()
  .then(console.log)
  .then(process.exit)
  .catch(console.error);
