if (process.env.NODE_ENV == "prod") {
  module.exports = require("./prod.js");
} else {
  module.exports = require("./dev.js");
}
