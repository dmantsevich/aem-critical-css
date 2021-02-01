const logger = require('./utils/logger');
const { INJECTION_TYPES } = require('./const');
const { writeFile, mkdir } = require('fs').promises;
const { normalizeUrl } = require('./utils');
const { resolveInjectionType } = require('./utils/configuration');
const { resolve, dirname, parse, format } = require('path');

class Component {

  get aemCriticalCSSFilePath() {
    return resolve(`${dirname(this.template)}/${this.config.criticalCSS.file}`) // Path to "_aem-critical-css.html(js)" file
  }

  get localCSSPath() {
    return `${this.config.web.localClientlib}/${this.publicCSSFilename}`;
  }

  get publicCSSPath() {
    return normalizeUrl(this.config.web.publicClientlib + this.publicCSSFilename);
  }

  get publicCSSFilename() {
    if (!this._publicCSSFilename) {
      const cssFilename = this.config.web.cssFilename;
      if (typeof cssFilename === 'function') {
        this._publicCSSFilename = cssFilename(this);
      } else {
        let hash = this.config.web.hash || '';
        hash && (hash = `.${hash}`);
        const parsedPath = parse(this.criticalCSS);
        delete parsedPath.base;
        parsedPath.name += hash;
        parsedPath.ext = '.css';
        this._publicCSSFilename = normalizeUrl(format(parsedPath));
      }
    }
    return this._publicCSSFilename;
  }

  constructor(config, options) {
    this._publicCSSFilename = null; // Filename for public CSS (only for injection type link)
    this.template = null; // Path to template
    this.criticalCSS = null; // Critical css definition via attribute
    this.cssSourceFile = null; // Path to CSS source file
    this.injectionType = null; // Injection type via attribute

    Object.assign(this, options);
    this.config = config;
  }

  async process() {
    await this.compileCSS();
    await this.deliver();
  }

  async compileCSS() {
    return require('./css-compiler')(this);
  }

  async deliver() {
    await resolveInjectionType(this);
    await require('./aem-critical-css').generate(this);
    await this.writeFiles();
  }

  async writeFiles() {
    return Promise.all([
      this.writeAEMCriticalCSSFile(),
      this.writeCSSFile()
    ]);
  }

  async writeAEMCriticalCSSFile() {
    try {
      const aemCriticalCSSFilePath = this.aemCriticalCSSFilePath;
      logger.info(`<fn>Creating</fn> <path>${aemCriticalCSSFilePath}</path> file.`);
      await writeFile(this.aemCriticalCSSFilePath, this.aemCriticalCSSFile);
    } catch (e) {
      logger.error(`Could not create <path>${aemCriticalCSSFilePath}</path>.`);
      throw e;
    }
  }

  async writeCSSFile() {
    if (this.injectionType === INJECTION_TYPES.LINK) {
      const cssTempPath = this.localCSSPath;
      try {
        logger.info(`<fn>Creating css file</fn>: <path>${cssTempPath}</path>...`);
        await mkdir(dirname(cssTempPath), { recursive: true });
        await writeFile(cssTempPath, this.css);
        this.config._cssWasSavedAsFile = true;
      } catch (e) {
        logger.error(`Could not create <path>${cssTempPath}</path>...`);
        throw e
      }
    }
  }
}

module.exports = Component;