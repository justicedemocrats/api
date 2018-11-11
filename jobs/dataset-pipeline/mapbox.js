const request = require("superagent");
const credentials = { access_token: process.env.MAPBOX_ACCESS_TOKEN };
const username = process.env.MAPBOX_USERNAME;
const baseUrl = "https://api.mapbox.com";

module.exports = {
  get: url => request.get(baseUrl + url).query(credentials),
  post: url => request.post(baseUrl + url).query(credentials),
  put: url => request.put(baseUrl + url).query(credentials),
  username: username
};
