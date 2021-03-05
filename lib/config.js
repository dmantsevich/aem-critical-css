const constants = require('./const');
const { resolveByGzipSize } = require('./utils');
const { join } = require('path');

module.exports = () => {
  return {
    /** Configuration for AEM project **/
    AEM: {
      projectRoot: './../', /** {string} AEM Project Root Folder **/
      components: 'ui.apps/src/main/content/jcr_root/apps/' /** {string} Path to HTL templates which should be processed. Path should be relative to ${config.AEM.projectRoot} **/
    },

    /** Configuration for AEM Critical CSS module **/
    criticalCSS: {
      file: '_aem-critical-css', /** {string} Name for output(generated) files. Result filename: ${config.criticalCSS.file}.${config.criticalCSS.type}. See Regular Workflow section **/
      type: constants.CRITICAL_CSS_TYPES.USEAPI, /** {string} Output file type. Possible values: CRITICAL_CSS_TYPES.USEAPI, CRITICAL_CSS_TYPES.TEMPLATE **/
      injectionType: constants.INJECTION_TYPES.AUTO, /** {string} Injection type. Possible values: INJECTION_TYPES.AUTO, INJECTION_TYPES.INLINE, INJECTION_TYPES.LINK. See Regular Workflow **/
      injectionTypeAutoResolver: resolveByGzipSize, /** {function(criticalCSSDefObj)} Function-Resolver for INJECTION_TYPES.AUTO. Calling for each AEM Critical CSS definition. Should return INJECTION_TYPES.INLINE or INJECTION_TYPES.LINK. By default: based on GZip size. See ${config.criticalCSS.gzipSize} option. **/
      gzipSize: 10 * 1024, // inline < 10kb(size). link >= 10kb(size) /** {integer} GZip size for injection type "auto" resolver. Working only with default ${config.criticalCSS.injectionTypeAutoResolver} resolver **/
      sourceAttr: '@aem-critical-css', /** {string} Attribute with path to critical css **/
      injectionTypeAttr: '@aem-critical-css-injectiontype', /** {string} Attribute with injection type configuration. If attribute is not present, then ${config.criticalCSS.injectionType} value will be used. **/
      serviceAttr: '@aem-critical-css-service', /** {string} Attribute with path to custom injector service. Level: Expert **/
      useAPIService: null, /** {string} Path to JS/Java service for injection resolving. By default built-in service will be used(AEMCriticalCSSService.js). Level: Expert **/
      AEMCriticalCSSServiceDestination: 'ui.apps/src/main/content/jcr_root/apps/aem-critical-css/utils/', /** {string} Path, where build-in AEMCriticalCSSService.js file should be saved. Level: Expert **/
      minifyOutput: true, /** {bool} Minify or not output **/
      destination: null
    },

    /** Configuration for CSS **/
    css: {
      sourceRoot: './', /** {string} Path to folder with css|less|scss|sass files **/
      sourceFilePathResolver: (criticalCSS, config) => join(config.css.sourceRoot, criticalCSS), /** {function(criticalCSSDefObj, config)} Function-resolver to CSS(Less, SCSS, SASS) files. Should return valid path to source file. By default search file inside ${config.css.sourceRoot} folder **/
      banner: function newDate() { return (new Date()).toLocaleString(); }, /** {string|function(criticalCSSDefObj)} Output CSS file banner **/
      postcss: { /** {object} PostCSS configuration **/
        'autoprefixer': { overrideBrowserslist: [ '> 1%', 'Last 2 versions', 'IE 11' ] }, /** {object} Configuration for autoprefixer **/
        'cssnano': { preset: 'default' }, /** {object} Configuration for cssnano **/
        /** Any other configurations for postcss plugins, where "key" is plugin name **/
        plugins: ['autoprefixer', 'cssnano'] /** {array[string|pluginInstance, string|pluginInstance ...]} List of PostCSS plugins **/
      },
      compile: null /** {function(criticalCSSDefObj)} Custom CSS compiler. **/
    },

    /** That configuration uses only for INJECTION_TYPE.LINK **/
    web: {
      cssFilename: null, /** {function(criticalCSSDefObj)} Output css filename. By default: the same as defined via @aem-critical-css-file + hash at the end **/
      publicClientlib: '/etc.clientlibs/aem-critical-css/', /** {string} Path to clientlib in WEB **/
      localClientlib: 'ui.apps/src/main/content/jcr_root/apps/aem-critical-css/', /** {string} Path to clientlib in your local file system **/
      hash: true, /** {bool|string} Add hash to css filename. If string, than it will be used as hash. **/
      hashSize: 12 /** {integer} Hash size **/
    }
  };
};