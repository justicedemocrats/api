const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const signup = require("./endpoints/signup");
const nominate = require("./endpoints/nominate");

app.use(bodyParser.json());
app.post("/signup", signup);
app.post("/nominate/district", nominate.district);
app.post("/nominate/candidate", nominate.candidate);

if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
