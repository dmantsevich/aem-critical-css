const merge = require('lodash.merge');

module.exports.process = async (customConfig = {}) => {
  const config = merge({}, require('./lib/config')(), customConfig);
  await require('./lib/process')(config);
};