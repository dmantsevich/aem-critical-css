const logger = require('./utils/logger');
const { INJECTION_TYPES, CRITICAL_CSS_TYPES } = require('./const');
const { writeFile, mkdir } = require('fs').promises;
const { normalizeUrl, changeJCRRoot, publicCSSFilename } = require('./utils');
const { resolveInjectionType } = require('./utils/configuration');
const { resolve, dirname } = require('path');

class Component {

  get aemCriticalCSSFilePath() {
    if (this.config.criticalCSS.destination === this.config.AEM.components) {
      return resolve(`${dirname(this.template)}/${this.config.criticalCSS.file}`) // Path to "_aem-critical-css.html(js)" file
    } else {
      return changeJCRRoot(`${dirname(this.template)}/${this.config.criticalCSS.file}`, this.config.criticalCSS.destination); // Path to "_aem-critical-css.html(js)" file
    }
  }

  constructor(config, options) {
    /* Map. Format:
      _publicCSSFilename = null;
      criticalCSS = null; // Critical css definition via attribute
      cssSourceFile = null; // Path to CSS source file
      injectionType = null; // Injection type via attribute
     */
    this.criticalCSSMap = null;
    this.template = null; // Path to template
    this.service = null; // Path to service. Used only in type === TEMPLATE


    Object.assign(this, options);
    this.config = config;

    if (config.criticalCSS.type !== CRITICAL_CSS_TYPES.TEMPLATE) {
      this.service = null;
    } else {
      this.service = this.service || this.config.criticalCSS.useAPIService;
    }
    this.updateCriticalCSSMap();
  }

  updateCriticalCSSMap() {
    Object.values(this.criticalCSSMap).forEach((criticalCSS) => {
      criticalCSS.template = this.template;
      criticalCSS.config = this.config;
      criticalCSS.service = this.service;
      const cssFilename = publicCSSFilename(criticalCSS);
      criticalCSS.localCSSPath = `${this.config.web.localClientlib}/${cssFilename}`;
      criticalCSS.publicCSSPath = normalizeUrl(this.config.web.publicClientlib + cssFilename);
    });
  }

  async forEachCriticalCSS(fn) {
    return Promise.all(Object.values(this.criticalCSSMap).map((criticalCSS) => fn(criticalCSS)));
  }

  async compileCSS() {
    const compile = require('./css-compiler');
    return this.forEachCriticalCSS((criticalCSS) => compile(criticalCSS));
  }

  async deliver() {
    await this.forEachCriticalCSS((criticalCSS) => resolveInjectionType(criticalCSS));
    await require('./aem-critical-css').generate(this);
    await this.writeFiles();
  }

  async writeFiles() {
    return Promise.all([
      this.writeAEMCriticalCSSFile(),
      this.forEachCriticalCSS((criticalCSS) => this.writeCSSFile(criticalCSS))
    ]);
  }

  async writeAEMCriticalCSSFile() {
    try {
      const aemCriticalCSSFilePath = this.aemCriticalCSSFilePath;
      logger.info(`<fn>Creating</fn> <path>${aemCriticalCSSFilePath}</path> file.`);
      await mkdir(dirname(aemCriticalCSSFilePath), { recursive: true });
      await writeFile(aemCriticalCSSFilePath, this.aemCriticalCSSFile);
    } catch (e) {
      logger.error(`Could not create <path>${aemCriticalCSSFilePath}</path>. ${e.message}`);
      throw e;
    }
  }

  async writeCSSFile(criticalCSS) {
    if (criticalCSS.injectionType === INJECTION_TYPES.LINK) {
      const cssTempPath = criticalCSS.localCSSPath;
      try {
        logger.info(`<fn>Creating css file</fn>: <path>${cssTempPath}</path>...`);
        await mkdir(dirname(cssTempPath), { recursive: true });
        await writeFile(cssTempPath, criticalCSS.css);
        this.config._cssWasSavedAsFile = true;
      } catch (e) {
        logger.error(`Could not create <path>${cssTempPath}</path>...`);
        throw e
      }
    }
  }
}

module.exports = Component;