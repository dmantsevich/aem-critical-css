const merge = require('lodash.merge');

Object.assign(module.exports, require('./lib/const'));

module.exports.process = async (customConfig = {}) => {
  const config = merge({}, require('./lib/config')(), customConfig);
  await require('./lib/process')(config);
};