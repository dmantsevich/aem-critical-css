const logger = require('./../utils/logger');
const postcss = require('postcss');
const filesize = require('filesize');
const logPrefix = '<blue>postcss</blue>:';

function initPlugins (postcssConfig) {
  return postcssConfig.plugins.map((pluginName) => {
    try {
      if (typeof pluginName === 'string') {
        const plugin = require(pluginName);
        const pluginConfig = postcssConfig[pluginName];
        return pluginConfig ? plugin(pluginConfig) : plugin;
      }
      return pluginName;
    } catch (e) {
      logger.error(`${logPrefix} During plugin <value>${pluginName}</value> initialization raised error. ${e.message}`);
      throw e;
    }
  });
}

function banner (component) {
  const banner = component.config.css.banner;
  if (typeof banner === 'string') return `/*${banner}*/`;
  if (typeof banner === 'function') return `/*${banner(component, component.config)}*/`;
  return '';
}

module.exports.process = async (component) => {
  const cssConfig = component.config.css;
  const postcssConfig = cssConfig.postcss;
  const cssSourceFile = component.cssSourceFile;
  if (postcssConfig && postcssConfig.plugins && postcssConfig.plugins.length) {

    logger.info(`${logPrefix} Start postprocessing <path>${cssSourceFile}</path> with plugins: <value>${postcssConfig.plugins.join(', ')}</value>`);

    return postcss(initPlugins(postcssConfig))
      .process(component.css, { from: cssSourceFile })
      .then(result => {
        result.warnings().forEach(warning => logger.warn(`<path>${cssSourceFile}</path>: - ${warning.toString()}`));
        component.css = banner(component) + result.css;
        logger.info(`${logPrefix} Postprocessing for <path>${cssSourceFile}</path> was <green>done</green>. Size: <value>${filesize(result.css.length)}</value>`);
      }, (e) => {
        logger.error(`${logPrefix} Looks like postcss can't parse your css file or unknown exception/error raised in plugins. Message: ${e.message}`);
        throw e;
      });
  } else {
    logger.warn(`${logPrefix} No configuration/plugins. Skip that step.`)
  }
};