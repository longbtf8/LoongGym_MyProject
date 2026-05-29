const { readdirSync } = require("fs");

const jobs = readdirSync(__dirname)
  .filter((__filename) => __filename !== "index.js")
  .reduce((obj, fileName) => {
    const type = fileName.replace(/\.js$/, "");
    return {
      ...obj,
      [type]: require(`./${fileName}`),
    };
  }, {});

module.exports = jobs;
