const Airtable = require("airtable");
const apiKey = process.env.AIRTABLE_API_KEY;
const base = new Airtable({ apiKey }).base(process.env.AIRTABLE_BASE);
module.exports = base;
