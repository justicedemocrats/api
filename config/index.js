if (process.env.NODE_ENV == "production") {
  module.exports = require("./production.js");
} else if (process.env.NODE_ENV == "ngrok") {
  module.exports = require("./ngrok.js");
} else {
  module.exports = require("./dev.js");
}
