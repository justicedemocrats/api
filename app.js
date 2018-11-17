const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const kueUiExpress = require("kue-ui-express");
const basicauth = require("basicauth-middleware");
const signup = require("./endpoints/signup");
const nominate = require("./endpoints/nominate");
const moduleHandler = require("./endpoints/module");
const cosigner = require("./endpoints/cosigner");
const { kue } = require("./lib/queue");
const config = require("./config");

app.use(cors());
app.use(bodyParser.json());
app.use(morgan());
const logBody = require("./lib/log-body");
app.use(logBody);
app.post("/signup", signup);
app.post("/nominate/district", nominate.district);
app.post("/nominate/candidate", nominate.candidate);
app.post("/module/:module", moduleHandler);
app.get("/cosigner/confirm/:id", cosigner.confirm);

if (module === require.main) {
  const jobs = require("./jobs");
  jobs.setup();

  kueUiExpress(app, "/" + config.KUE_PASSWORD + "/", "/kue-api");
  app.use("/kue-api/", kue.app);

  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
