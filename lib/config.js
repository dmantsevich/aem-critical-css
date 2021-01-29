const constants = require('./const');

module.exports = () => {
  return {
    AEM: {
      projectRoot: './../',
      components: 'ui.apps/src/main/content/jcr_root/apps/'
    },
    criticalCSS: {
      file: '_aem-critical-css',
      type: constants.CRITICAL_CSS_TYPE.USEAPI,
      injectionType: constants.CRITICAL_CSS_INJECTION_TYPE.AUTO,
      sourceAttr: '@aem-critical-css',
      injectionTypeAttr: '@aem-critical-css-injectiontype'
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
      hash: true,
      hashSize: 12
    }
  };
};