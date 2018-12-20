const config = require("../../config");
const knowledge = require("knowledge-node")({
  serverKey: config.GOOGLE_KNOWLEDGE_GRAPH_API_KEY
});
const imageSearch = "free-google-image-search";
const Airtable = require("airtable");
const airtable = new Airtable({
  apiKey: config.AIRTABLE_API_KEY
}).base(config.AIRTABLE_CONGRESSIONAL_BASE);

module.exports = async function() {
  const districts = {};
  return new Promise((resolve, reject) => {
    airtable("House")
      .select({ view: "Grid view" })
      .eachPage(
        async function onPage(records, next) {
          for (let r of records) {
            const kgAttributes = await getKGAttributes(r.fields["Name"]);

            districts[r.fields["ID"]] = {
              member_name: r.fields["Name"],
              member_party: r.fields["Party"],
              member_is_jd: !!(
                r.fields["Tags"] &&
                r.fields["Tags"].includes("Justice Democrat")
              ),
              member_supports_gnd: !!(
                r.fields["Tags"] &&
                r.fields["Tags"].includes("GND Committee Supporter")
              ),
              image: r.fields["Image Override"] || kgAttributes.image
            };
          }

          next();
        },
        function onDone(err) {
          return resolve(districts);
        }
      );
  });
};

async function getKGAttributes(name) {
  const params = knowledge.buildParams(
    `${name}`,
    Object.values(knowledge.types),
    1,
    true
  );

  const results = await knowledge.search(params);

  let image;

  try {
    image = results.itemListElement[0].result.image.contentUrl;
  } catch (ex) {
    console.log(`No image found for ${name} – searching Google`);
    const results = await imageSearch.search(name);
    console.log(results);
    try {
      image = results[0];
      console.log(`Using image ${image}`);
    } catch (ex) {
      console.log(`No image found for ${name} from Google`);
    }
  }

  return { image };
}
