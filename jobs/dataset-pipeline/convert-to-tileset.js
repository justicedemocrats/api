const log = require("debug")("api:convert-to-tileset");
const mapbox = require("./mapbox");
const username = mapbox.username;
const progressCheckInterval = 1000;

async function convertDatasetToTileset(dataset) {
  const body = {
    tileset: `${username}.${dataset.name}`,
    url: `mapbox://datasets/${username}/${dataset.id}`,
    name: dataset.name
  };

  const { body: upload } = await mapbox
    .post(`/uploads/v1/${username}`)
    .send(body);

  await sleep(progressCheckInterval);
  while (await isInProgress(upload.id, dataset.name)) {
    await sleep(progressCheckInterval);
  }

  log("Finished conversion for %s", dataset.name);

  return upload;
}

async function isInProgress(upload_id, name) {
  const { body: upload } = await mapbox.get(
    `/uploads/v1/${username}/${upload_id}`
  );

  if (upload.complete !== true) {
    log("Progress on conversion for %s: %d", name, upload.progress);
  }

  return upload.complete !== true;
}

function sleep(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), milliseconds);
  });
}

module.exports = convertDatasetToTileset;
