const config = require("../config");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(config.CRYPTO_SECRET);
module.exports = cryptr;
