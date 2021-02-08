const logger = require('./../utils/logger');
const postcss = require('postcss');
const logPrefix = '<fn>postcss</fn>:';

function initPlugins (component, postcssConfig) {
  if (typeof postcssConfig.plugins === 'function') {
    return postcssConfig.plugins(component);
  }
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
  if (postcssConfig && postcssConfig.plugins) {

    const plugins = initPlugins(component, postcssConfig);
    if (plugins.length) {
      logger.info(`${logPrefix} Start postprocessing <path>${cssSourceFile}</path> with plugins: <value>${plugins.map((p) => p.postcssPlugin).join(', ')}</value>`);
      return postcss(plugins)
        .process(component.css, { from: cssSourceFile })
        .then(result => {
          result.warnings().forEach(warning => logger.warn(`<path>${cssSourceFile}</path>: - ${warning.toString()}`));
          component.css = banner(component) + result.css;
          component.cssSize = component.css.length;
          logger.info(`${logPrefix} Postprocessing for <path>${cssSourceFile}</path> was <green>done</green>. Size: <filesize>${result.css.length}</filesize>`);
        }, (e) => {
          logger.error(`${logPrefix} Looks like postcss can't parse your css file or unknown exception/error raised in plugins. Message: ${e.message}`);
          throw e;
        });
    }
  }

  logger.warn(`${logPrefix} No configuration/plugins. Skip that step.`);
};