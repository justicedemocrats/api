const config = require("../config");
const Airtable = require("airtable");
const apiKey = config.AIRTABLE_API_KEY;
const base = new Airtable({ apiKey }).base(config.AIRTABLE_BASE);
module.exports = base;
