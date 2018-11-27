const db = require("../lib/db");
const upsertPerson = require("../lib/upsert-person");

async function main() {
  const nominations = await db("nominations")
    .select("data")
    .where({ type: "candidate" });

  console.log(
    `Found ${
      nominations.length
    } candidate nominations to rerun upsert person on the nominee for`
  );

  for (let nomination of nominations) {
    const data = nomination.data;
    const nominee_info = {
      name: data["Nominee First Name"] + " " + data["Nominee Last Name"],
      number: data["Nominee Phone"],
      email: data["Nominee Email"],
      zip: data["Nominee Zip"]
    };
    console.log(nominee_info);
  }

  return "done";
}

main()
  .then(console.log)
  .then(process.exit)
  .catch(console.error);
