const logger = require('./utils/logger');
const packageJSON = require('./../package.json');
const { INJECTION_TYPES } = require('./const');
const filesize = require('filesize');

module.exports = async (config) => {
  logger.info(`... <fn>AEM Critical CSS</fn> <blue>v${packageJSON.version}</blue> ...`);

  logger.info(`<phase>Configuration</phase>`);
  await require('./utils/configuration').prepareConfiguration(config); // Merge default config with custom

  logger.info(`<phase>Analyzing Templates</phase>`);
  const { analyzeTemplates } = require('./utils/aem-templates');
  const components = await analyzeTemplates(config); // Create components

  if (!components.length) {
    logger.fatal(`No AEM Critical CSS declaration found. Check your <!>configuration, templates & read documentation</!>.`);
    throw new Error(`No AEM Critical CSS declaration found. Check your configuration, templates & read documentation.`);
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
  let status = '';
  components.forEach((component) => {
    status += `
- <path>${component.template}</path>
\t * Source file: <path>${component.cssSourceFile}</path>
\t * Injection type: <blue>${component.injectionType}</blue>
\t * WEB Path: <yellow>${component.injectionType === INJECTION_TYPES.LINK ? component.publicCSSPath : 'none'}</yellow>
\t * Local Path: ${component.injectionType === INJECTION_TYPES.LINK ? '<path>' + component.localCSSPath + '</path>' : '<yellow>none</yellow>'}
\t * AEM Critical CSS file: <path>${component.aemCriticalCSSFilePath}</path>
\t * CSS size: <number>${filesize(component.cssSize)}</number>
`
  });
  logger.info(status);

  logger.info(`... <fn>AEM Critical CSS:</fn> <green>SUCCESS</green> ...`);
};