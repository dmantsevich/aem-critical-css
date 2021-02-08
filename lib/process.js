const { LEVELS } = require('@dmantsevich/colorful-semantic-logger');
const logger = require('./utils/logger');
const packageJSON = require('./../package.json');

module.exports = async (config) => {

  if (config.logLevel) {
    const level = LEVELS[config.logLevel.toUpperCase()];
    level && (logger.level = level);
  }

  logger.info(`... <fn>AEM Critical CSS</fn> <blue>v${packageJSON.version}</blue> ...`);

  logger.info(`<phase>Configuration</phase>`);
  await require('./utils/configuration').prepareConfiguration(config); // Merge default config with custom

  logger.info(`<phase>Analyzing Templates</phase>`);
  const { analyzeTemplates } = require('./utils/aem-templates');
  const components = await analyzeTemplates(config); // Create components

  if (!components.length) {
    logger.throwFatal(`No AEM Critical CSS declaration found. Check your <!>configuration, templates & read documentation</!>.`);
  }

  logger.info(`<phase>CSS Compilation</phase>`);
  await Promise.all(components.map((component) => component.compileCSS())); // Compile css

  logger.info(`<phase>Critical CSS Delivery</phase>`);
  await Promise.all(components.map((component) => component.deliver())); //  Deliver generated files

  // Used only for "injectionType === link"
  const { markClientlibAsPublic, deployAEMCriticalCSSService } = require('./aem-critical-css');
  logger.info(`<phase>Postprocessing</phase>`);
  await deployAEMCriticalCSSService(config);
  await markClientlibAsPublic(config);

  logger.info(`<phase>Status</phase>`);
  logger.info(require('./utils/status')(components));
  logger.info(`... <fn>AEM Critical CSS:</fn> <green>SUCCESS</green> ...`);

  return components;
};