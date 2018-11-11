const fs = require("fs");
const rimraf = require("rimraf");
const log = require("debug")("api:produce-geojson");

/*
 *
 * Unused function used to transform https://github.com/unitedstates/districts
 * into the current folder structure in /geo-data
 *
 */
function renameFiles() {
  const folders = fs.readdirSync("./geo-data/states");
  const states = folders.filter(
    folder => !folder.includes("geojson") && !folder.includes(".")
  );

  for (let state of states) {
    try {
      fs.renameSync(
        `./geo-data/states/${state}/shape.geojson`,
        `./geo-data/states/${state}.geojson`
      );

      rimraf(`./geo-data/states/${state}`, err => {
        log(`Deleted ${state} folder`);
      });

      log(`Did ${state}`);
    } catch (ex) {
      log("Could not do %s", state);
    }
  }
  log("Done");
  return true;
}

/*
 * Takes a type argument, corresponding to `states` or `districts`

 * Produces a combined geojson file called `type`.json will the geojsons
 * concattenated and features added
 * 
 * For each geojson in the list, it will call `getProperties` on the filename
 * 
 * Retruns a promise that just resolves with true on success
 */

function produceGeoJson(type, getProperties) {
  return new Promise((resolve, reject) => {
    fs.readdir(`./geo-data/${type}`, async (err, objects) => {
      const geoJsonObjects = await Promise.all(
        objects
          .filter(filename => filename.includes(".geojson"))
          .map(
            filename =>
              new Promise((resolve, reject) => {
                const fileContents = fs.readFile(
                  `./geo-data/${type}/${filename}`,
                  (err, contents) => {
                    const geoJson = JSON.parse(contents.toString());
                    resolve([filename, geoJson]);
                  }
                );
              })
          )
      );

      const featureCollection = {
        type: "FeatureCollection",
        features: geoJsonObjects.map(([filename, obj]) => ({
          type: "Feature",
          geometry: obj.geometry ? obj.geometry : obj,
          properties: getProperties(filename)
        }))
      };

      resolve(featureCollection);
    });
  });
}

module.exports = produceGeoJson;
