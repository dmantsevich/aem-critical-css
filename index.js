const merge = require('lodash.merge');

Object.assign(module.exports, require('./lib/const'));

module.exports.process = async (customConfig = {}) => {
  const config = merge({}, require('./lib/config')(), customConfig);
  try {
    if (typeof customConfig.css.postcss.plugins !== 'undefined') {
      config.css.postcss.plugins = customConfig.css.postcss.plugins;
    }
  } catch (e) {}
  await require('./lib/process')(config);
};