const swaggerUi = require('swagger-ui-express');
const path = require("path")
const yaml = require("yamljs")

const specs = yaml.load(path.join(__dirname, "build.yaml"))

module.exports = {
  swaggerUi,
  specs
}