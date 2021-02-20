const constants = require('./const');
const { resolveByGzipSize } = require('./utils');
const { join } = require('path');

module.exports = () => {
  return {
    AEM: {
      projectRoot: './../',
      components: 'ui.apps/src/main/content/jcr_root/apps/'
    },
    criticalCSS: {
      file: '_aem-critical-css',
      type: constants.CRITICAL_CSS_TYPES.USEAPI,
      injectionType: constants.INJECTION_TYPES.AUTO,
      injectionTypeAutoResolver: resolveByGzipSize,
      gzipSize: 10 * 1024, // inline < 10kb(size). link >= 10kb(size)
      sourceAttr: '@aem-critical-css',
      injectionTypeAttr: '@aem-critical-css-injectiontype',
      serviceAttr: '@aem-critical-css-service',
      useAPIService: null,
      AEMCriticalCSSServiceDestination: 'ui.apps/src/main/content/jcr_root/apps/aem-critical-css/utils/',
      minifyOutput: true,
      destination: null
    },
    css: {
      sourceRoot: './',
      sourceFilePathResolver: (criticalCSS, config) => join(config.css.sourceRoot, criticalCSS),
      banner: function newDate() { return (new Date()).toLocaleString(); },
      postcss: {
        'autoprefixer': { overrideBrowserslist: [ '> 1%', 'Last 2 versions', 'IE 11' ] },
        'cssnano': { preset: 'default', },
        plugins: ['autoprefixer', 'cssnano']
      },
      compile: null
    },
    web: {
      cssFilename: null,
      publicClientlib: '/etc.clientlibs/aem-critical-css/',
      localClientlib: 'ui.apps/src/main/content/jcr_root/apps/aem-critical-css/',
      hash: true,
      hashSize: 12
    }
  };
};