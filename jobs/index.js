const fs = require("fs");
const queue = require("../lib/queue");

module.exports = {
  setup: () =>
    fs
      .readdirSync("./jobs")
      .filter(file => file.includes(".js"))
      .filter(file => !file.includes("index"))
      .forEach(file => {
        const name = file.split(".js")[0];
        const fn = require(`./${file}`);
        queue.register(name, (job, done) => {
          console.log(`Starting ${job.id}: ${name}`);
          fn(job.data)
            .then(() => {
              console.log(`Finished ${job.id}: ${name}`);
              done();
            })
            .catch(done);
        });
      })
};
