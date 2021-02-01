const constants = require('./const');
const { gzipSize } = require('./utils');
const logger = require('./utils/logger');

module.exports = () => {
  return {
    AEM: {
      projectRoot: './../',
      components: 'ui.apps/src/main/content/jcr_root/apps/'
    },
    criticalCSS: {
      file: '_aem-critical-css',
      type: constants.CRITICAL_CSS_TYPES.TEMPLATE,
      injectionType: constants.INJECTION_TYPES.AUTO,
      injectionTypeAutoResolver: (component) => {
        const gzip = gzipSize(component.css);
        const filesize = require('filesize');
        const type = (gzip < component.config.gzipSize) ? constants.INJECTION_TYPES.INLINE : constants.INJECTION_TYPES.LINK;
        logger.info(`<blue>injectionTypeAutoResolver</blue>: <path>${component.cssSourceFile}</path> <blue>gzip size</blue> is <number>${filesize(gzip)}</number>. Injection type: <value>${type}</value>`);
        return type;
      },
      gzipSize: 10 * 1024, // inline < 10kb(size). link >= 10kb(size)
      sourceAttr: '@aem-critical-css',
      injectionTypeAttr: '@aem-critical-css-injectiontype',
      useAPIService: 'ui.apps/src/main/content/jcr_root/apps/aem-critical-css/clientlibs/aem-critical-css/utils/AEMCriticalCSSService.js'
    },
    css: {
      sourceRoot: './',
      banner: () => (new Date()).toLocaleString(),
      postcss: {
        'autoprefixer': { overrideBrowserslist: [ '> 1%', 'Last 2 versions', 'IE 11' ] },
        'cssnano': { preset: 'default', },
        plugins: ['autoprefixer', 'cssnano']
      }
    },
    web: {
      cssFilename: null,
      publicClientlib: '/etc.clientlibs/aem-critical-css/clientlibs/aem-critical-css/',
      localClientlib: 'ui.apps/src/main/content/jcr_root/apps/aem-critical-css/clientlibs/aem-critical-css/',
      hash: true,
      hashSize: 12
    }
  };
};