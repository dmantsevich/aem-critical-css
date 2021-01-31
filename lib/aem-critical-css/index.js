const logger = require('./../utils/logger');

exports.generate = async (component) => {
  const config = component.config.criticalCSS;
  const criticalCSSType = config.type;
  logger.info(`Start generating <value>${config.file}</value> file for <path>${component.template}</path>.`);
  try {
    component.aemCriticalCSSFile = require(`./type.${criticalCSSType}`)(component);
  } catch (e) {
    logger.error(`Could not generate <value>${config.file}</value> file for <path>${component.template}</path> -> <path>${component.cssSourceFile}</path>.`);
    throw e
  }
};