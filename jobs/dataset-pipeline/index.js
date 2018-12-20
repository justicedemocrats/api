const _ = require("lodash");
const produceGeoJson = require("./produce_geojson");
const { updateDataset, ensureDatasets } = require("./update_dataset");
const convertToTileset = require("./convert-to-tileset");
const getMemberInfo = require("./get-member-info");
const db = require("../../lib/db");

const breakdowns = {};
async function initializeProperties() {
  breakdowns.state = await getBreakdown("state");
  breakdowns.district = await getBreakdown("district");
  breakdowns.tags = await getMemberInfo();
}

async function getProperties(filename) {
  const file = filename.split(".")[0];
  let type;
  let state;
  let district;
  let state_district;

  if (file.split("-").length == 1) {
    type = "state";
    state = file;
  }

  if (file.split("-").length == 2) {
    type = "district";
    state = file.split("-")[0];
    district = file.split("-")[1];
    state_district = file;
  }

  const result = {
    name: filename.split(".")[0],
    state: state,
    nominations: breakdowns[type].nominations[file] || 0,
    candidates: breakdowns[type].candidates[file] || 0
  };

  if (district)
    Object.assign(
      result,
      { district, state_district },
      breakdowns.tags[state_district]
    );

  return result;
}

async function getBreakdown(type) {
  const addSelect = pipeline =>
    type == "district" ? pipeline.select("district") : pipeline;
  const addGroupBy = pipeline =>
    type == "district" ? pipeline.groupBy("district") : pipeline;

  const nominations = await addGroupBy(
    addSelect(db("nominations").select("state"))
      .count("id")
      .groupBy("state")
  );

  const candidates = await addGroupBy(
    addSelect(
      db("nominations")
        .where({ type: "candidate" })
        .select("state")
    )
      .count("id")
      .groupBy("state")
  );

  return { nominations: toMap(nominations), candidates: toMap(nominations) };
}

function toMap(data) {
  return _.fromPairs(
    data
      .map(row =>
        row.district
          ? [`${row.state}-${row.district}`, row.count]
          : [`${row.state}`, row.count]
      )
      .map(([key, val]) => [key, parseInt(val)])
  );
}

async function main() {
  const datasets = await ensureDatasets();
  const types = Object.keys(datasets);

  for (let type of types) {
    console.log("Computing feature collection for type %s", type);
    await initializeProperties();
    const featureCollection = await produceGeoJson(type, getProperties);
    console.log("Got feature colleciton for type %s", type);
    await updateDataset(datasets[type], featureCollection.features);
  }

  await Promise.all(types.map(type => convertToTileset(datasets[type])));

  return true;
}

module.exports = main;
