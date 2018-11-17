const config = require("../config");
const kue = require("kue");
const e = { kue };

const VERBOSE = false;

if (process.env.NODE_ENV !== "test") {
  const queue = kue.createQueue({
    prefix: "q",
    redis: {
      port: config.REDIS_PORT || 6379,
      host: config.REDIS_URL || "localhost",
      auth: config.REDIS_PASSWORD
    }
  });

  Object.assign(e, {
    enqueue: (name, data) =>
      new Promise((resolve, reject) =>
        queue
          .createJob(name, data)
          .save(err => (err ? reject(err) : resolve(true)))
      ),

    register: (name, fn) => queue.process(name, fn)
  });
} else {
  Object.assign(e, {
    enqueue: (name, data) =>
      new Promise((resolve, reject) => {
        if (VERBOSE) {
          console.log(
            `TEST: would have queued ${name} with ${JSON.stringify(data)}`
          );
        }
        resolve(true);
      }),

    register: (name, fn) => {
      if (VERBOSE) {
        console.log(`TEST: would have registered ${fn} for name`);
      }
    }
  });
}

module.exports = e;
