const logger = require('./../utils/logger');
const { CRITICAL_CSS_TYPES } = require('./../const');
const { copyFile, writeFile, mkdir, readFile } = require('fs').promises;
const { resolve, dirname } = require('path');

exports.generate = async (component) => {
  const config = component.config.criticalCSS;
  const criticalCSSType = config.type;
  logger.info(`Start <fn>generating</fn> <value>${config.file}</value> <fn>file</fn> for <path>${component.template}</path>`);
  try {
    component.aemCriticalCSSFile = await require(`./type.${criticalCSSType}`)(component);
  } catch (e) {
    logger.error(`Could not generate <value>${config.file}</value> file for <path>${component.template}</path> -> <path>${component.cssSourceFile}</path>.`);
    throw e
  }
};

exports.deployAEMCriticalCSSService = async (config) => {
  const useAPIService = config.criticalCSS.useAPIService || '';
  if (useAPIService.endsWith('AEMCriticalCSSService.js') && config.criticalCSS.type === CRITICAL_CSS_TYPES.TEMPLATE) {
    logger.info(`<fn>Deploy</fn> <blue>AEMCriticalCSSService.js</blue> <fn>service</fn> to <path>${useAPIService}</path>.`);
    try {
      await mkdir(dirname(useAPIService), { recursive: true });

      const UglifyJS = require('uglify-js');

      const code = `
use(function () {
  ${config._AEMCriticalCSSService}
  return { shouldInject: CSSLoadingService.shouldInject(this.css) };
});`;

      const result = UglifyJS.minify(code);
      if (result.error) {
        logger.error(`<red>${result.error}</red>`);
        throw new Error(result.error);
      }

      await writeFile(useAPIService, result.code);
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
      logger.error(`Clientlib <path>${contentXMLPath}</path> should be public (missed <!>allowProxy="{Boolean}true"</!> property)`);
      throw new Error(`Clientlib ${contentXMLPath} should be public (missed allowProxy="{Boolean}true" property)`);
    }
  }
};