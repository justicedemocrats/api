require("dotenv").config();
const main = require("./index");

main()
  .then(console.log)
  .catch(console.error);
