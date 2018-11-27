const db = require("../lib/db");
const nameify = require("../lib/nameify");
const upsertPerson = require("../lib/upsert-person");

async function main() {
  const nominations = await db("nominations")
    .select("data", "id")
    .where({ type: "candidate" });

  console.log(
    `Found ${
      nominations.length
    } candidate nominations to rerun upsert person on the nominee for`
  );

  for (let nomination of nominations) {
    const data = nomination.data;
    const nominee_info = {
      id: nomination.id,
      name: nameify(data["Nominee First Name"], data["Nominee Last Name"]),
      number: data["Nominee Phone"],
      email: data["Nominee Email"],
      zip: data["Nominee Zip"]
    };

    if (nominee_info.number && !nominee_info.email) {
      console.log(
        `Should re-upsert ${nominee_info.id}: ${JSON.stringify(nominee_info)}`
      );

      const upsert_result = await upsertPerson(nominee_info);
      console.log(32);
      console.log(upsert_result);
      await new Promise((resolve, reject) =>
        setTimeout(() => resolve(true), 5000)
      );
    } else {
      console.log(
        `Should not re-upsert ${nominee_info.id}: ${JSON.stringify(
          nominee_info
        )}`
      );
    }
  }

  return "done";
}

main()
  .then(console.log)
  .then(process.exit)
  .catch(console.error);
