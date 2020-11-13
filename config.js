const PORT = process.env.PORT || 8080;

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-local-devConnector";


module.exports = { PORT };
