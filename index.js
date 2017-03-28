var setPaths = require('./set_paths');

// set main framework folders paths
var config = require('./config');
config = setPaths(config, __dirname);

// set global additional functions
require(config.ROOT_DIR + config.BASE);

// exports main application constructor
module.exports = require(config.ROOT_DIR + config.APP)(config);