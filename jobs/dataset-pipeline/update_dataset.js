const _ = require("lodash");
const log = require("debug")("api:upload-geojson");
const mapbox = require("./mapbox");
const username = mapbox.username;

async function ensureDatasets() {
  const { body: datasets } = await mapbox.get(`/datasets/v1/${username}`);

  const statesPromise = (async () => {
    const statesDataset = datasets.filter(d => d.name == "states")[0];
    if (!statesDataset) {
      const created = await createDataset("states");
      return created.body;
    }
    return statesDataset;
  })();

  const districtsPromise = (async () => {
    const districtsDataset = datasets.filter(d => d.name == "districts")[0];
    if (!districtsDataset) {
      const created = await createDataset("districts");
      return created.body;
    }
    return districtsDataset;
  })();

  const [states, districts] = await Promise.all([
    statesPromise,
    districtsPromise
  ]);

  return { states, districts };
}

async function createDataset(type) {
  return await mapbox
    .post(`/datasets/v1/${username}`)
    .send({ name: type, description: `Nomination features by ${type}` });
}

async function updateFeature(dataset, feature) {
  const resp = await mapbox
    .put(
      `/datasets/v1/${username}/${dataset.id}/features/${
        feature.properties.name
      }`
    )
    .send(feature);

  return resp.body;
}

const DEFAULT_CONCURRENCY = 5;
async function updateDataset(
  dataset,
  features,
  CONCURRENCY = DEFAULT_CONCURRENCY
) {
  const chunks = _.chunk(features, CONCURRENCY);
  for (let chunk of chunks) {
    await Promise.all(chunk.map(feature => updateFeature(dataset, feature)));
  }
}

module.exports = { updateDataset, ensureDatasets };
