require("dotenv").config();
const produceGeoJson = require("./produce_geojson");
const { updateDataset, ensureDatasets } = require("./update_dataset");
const convertToTileset = require("./convert-to-tileset");
const log = require("debug")("api:dataset-pipeline");

function getProperties(filename) {
  return {
    name: filename.split(".")[0],
    nominees: Math.random() * 1000
  };
}

async function main() {
  const datasets = await ensureDatasets();
  const types = Object.keys(datasets);

  for (let type of types) {
    log("Computing feature collection for type %s", type);
    const featureCollection = await produceGeoJson(type, getProperties);
    log("Got feature colleciton for type %s", type);
    // await updateDataset(datasets[type], featureCollection.features);
  }

  await Promise.all(types.map(type => convertToTileset(datasets[type])));

  return true;
}

main()
  .then(console.log)
  .catch(console.error);
