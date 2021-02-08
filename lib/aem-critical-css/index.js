const logger = require('./../utils/logger');
const { CRITICAL_CSS_TYPES } = require('./../const');
const { copyFile, writeFile, mkdir, readFile } = require('fs').promises;
const { resolve, dirname } = require('path');
const { minifyJS } = require('./utils');

exports.generate = async (component) => {
  const config = component.config.criticalCSS;
  const criticalCSSType = config.type;
  logger.info(`Start <fn>generating</fn> <value>${config.file}</value> <fn>file</fn> for <path>${component.template}</path>`);
  try {
    component.aemCriticalCSSFile = await require(`./type.${criticalCSSType}`)(component);
  } catch (e) {
    logger.error(`Could not generate <value>${config.file}</value> file for <path>${component.template}</path>. ${e.message}`);
    throw e;
  }
};

exports.deployAEMCriticalCSSService = async (config) => {
  const { useAPIService, AEMCriticalCSSServiceDestination, type } = config.criticalCSS;
  if (useAPIService.endsWith('/AEMCriticalCSSService.js') && type === CRITICAL_CSS_TYPES.TEMPLATE) {
    logger.info(`<fn>Deploy</fn> <blue>AEMCriticalCSSService.js</blue> <fn>service</fn> to <path>${AEMCriticalCSSServiceDestination}</path>.`);
    try {
      await mkdir(dirname(AEMCriticalCSSServiceDestination), { recursive: true });
      const commonBanner = require('./common-banner');
      const code = `
/*! 
${commonBanner({'Service': 'Built-in AEM Critical CSS Service'})}
*/
use(function () {
  ${config._AEMCriticalCSSService}
  var props = Object.keys(this);
  var model = {};
  var instance = this;
  props.forEach(function (prop) {
    if (prop.indexOf('InjectionType') === -1) {
      model['shouldInject_' + prop] = CSSLoadingService.shouldInject(instance[prop]) || 'already injected';
    } 
  });
  return model;
});`;

      const result = minifyJS(config, code);
      if (result.error) {
        logger.throwError(`<red>${result.error}</red>`);
      }

      await writeFile(AEMCriticalCSSServiceDestination, result.code);
    } catch (e) {
      logger.error(`Could not deploy <blue>AEMCriticalCSSService.js</blue> service. ${e.message}`);
      throw e;
    }
  }
};

exports.markClientlibAsPublic = async (config) => {
  const localClientlib = config.web._localClientlib;
  if (localClientlib && config._cssWasSavedAsFile) {
    const contentXMLPath = `${localClientlib}/.content.xml`;
    let isPublicClientLibs = false;
    logger.info(`<fn>localClientlib</fn>: Analyzing <path>${contentXMLPath}</path> configuration. Allowed only "<blue>allowProxy="{Boolean}true"</blue>" clientlibs.`);
    try {
      const contentXML = await readFile(contentXMLPath);
      isPublicClientLibs = contentXML.indexOf('allowProxy="{Boolean}true"') !== -1;
    } catch (e) {
      await mkdir(dirname(contentXMLPath), { recursive: true });
      await copyFile(resolve(__dirname + '/.content.xml'), contentXMLPath);
      isPublicClientLibs = true;
    }

    if (!isPublicClientLibs) {
      logger.throwError(`Clientlib <path>${contentXMLPath}</path> should be public (missed <!>allowProxy="{Boolean}true"</!> property)`);
    }
  }
};