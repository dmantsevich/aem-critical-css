const logger = require('./../utils/logger');
const { CRITICAL_CSS_TYPES } = require('./../const');
const { copyFile, mkdir, readFile } = require('fs').promises;
const { resolve, dirname } = require('path');

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

exports.deployAEMCriticalCSSService = async (config) => {
  const useAPIService = config.criticalCSS.useAPIService || '';
  if (useAPIService.endsWith('AEMCriticalCSSService.js') && config.criticalCSS.type === CRITICAL_CSS_TYPES.TEMPLATE) {
    logger.info(`Start deploying <blue>AEMCriticalCSSService.js</blue> service to <path>${useAPIService}</path>.`);
    try {
      await mkdir(dirname(useAPIService), { recursive: true });
      await copyFile(resolve('./lib/aem-critical-css/AEMCriticalCSSService.js'), useAPIService);
    } catch (e) {
      logger.error(`Could not deploy <blue>AEMCriticalCSSService.js</blue> service. ${e.message}`);
      throw e;
    }
  }
};

exports.markClientlibAsPublic = async (config) => {
  const localClientlib = config.web._localClientlib;
  if (localClientlib && config._cssWasCreatedAsFile) {
    const contentXMLPath = `${localClientlib}/.content.xml`;
    let isPublicClientLibs = false;
    logger.info(`Analyzing <path>${contentXMLPath}</path> configuration. Allowed only "<blue>public</blue>" clientlibs.`);
    try {
      const contentXML = await readFile(contentXMLPath);
      isPublicClientLibs = contentXML.indexOf('allowProxy="{Boolean}true"') !== -1;
    } catch (e) {
      await mkdir(dirname(contentXMLPath), { recursive: true });
      await copyFile(resolve('./lib/aem-critical-css/.content.xml'), contentXMLPath);
      isPublicClientLibs = true;
    }

    if (!isPublicClientLibs) {
      logger.error(`Clientlib <path>${contentXMLPath}</path> should be public (missed <!>allowProxy="{Boolean}true</!> property)`);
      throw new Error(`Clientlib ${contentXMLPath} should be public (missed allowProxy="{Boolean}true property)`);
    }

  }
};