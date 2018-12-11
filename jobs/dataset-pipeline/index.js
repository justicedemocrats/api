const produceGeoJson = require("./produce_geojson");
const { updateDataset, ensureDatasets } = require("./update_dataset");
const convertToTileset = require("./convert-to-tileset");
const _ = require("lodash");
const db = require("../../lib/db");

const breakdowns = {};
async function getProperties(filename) {
  const file = filename.split(".")[0];
  let type;

  if (file.split("-").length == 1) {
    type = "state";
    if (!breakdowns.state) {
      breakdowns.state = await getBreakdown("state");
      type = "state";
    }
  }

  if (file.split("-").length == 2) {
    type = "district";
    if (!breakdowns.district) {
      breakdowns.district = await getBreakdown("district");
    }
  }

  const result = {
    name: filename.split(".")[0],
    nominations: breakdowns[type].nominations[file] || 0,
    candidates: breakdowns[type].candidates[file] || 0
  };

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
    const featureCollection = await produceGeoJson(type, getProperties);
    console.log("Got feature colleciton for type %s", type);
    await updateDataset(datasets[type], featureCollection.features);
  }

  await Promise.all(types.map(type => convertToTileset(datasets[type])));

  return true;
}

module.exports = main;
