const db = require("../lib/db");
const airtable = require("../lib/airtable");

async function main() {
  const bad_names = await db("people")
    .where("name", "ilike", "%  %")
    .select("id", "name", "airtable_id");

  for (let person of bad_names) {
    const good_name = person.name.replace("  ", " ");
    console.log(
      `Correcting https://airtable.com/tblsAKbuQC0rB1dMN/viwS9uJyht19qvqkE/${
        person.airtable_id
      } (${person.id}) to ${good_name}`
    );
    const update_result = await db("people")
      .update({ name: good_name })
      .where({ id: person.id });

    console.log(update_result);

    const airtable_result = await new Promise((resolve, reject) => {
      airtable("People").update(
        person.airtable_id,
        { Name: good_name },
        (err, resp) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          return resolve(resp);
        }
      );
    });

    console.log(airtable_result);

    await new Promise((resolve, reject) =>
      setTimeout(() => resolve(true), 5000)
    );
  }

  return "done";
}

main()
  .then(console.log)
  .catch(console.error);
