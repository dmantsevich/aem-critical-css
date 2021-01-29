const logger = require('./utils/logger');

module.exports = async (config) => {
  logger.info(`... <begin> ...`);
  require('./utils/configuration').prepareConfiguration(config);
  console.dir(`::: CONFIGURATION :::`);
  console.dir(config);
  const { analyzeTemplates } = require('./utils/aem-templates');
  const components = await analyzeTemplates(config);
  await Promise.all(components.map((component) => component.process()))
  logger.info(`... </end> ...`);
};