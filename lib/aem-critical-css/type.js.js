const tag = {
  link(component) {
    return `<link href="${component.publicCSSPath}" rel="stylesheet" type="text/css" />`;
  },
  inline(component) {
    return `<style>${component.css}</style>`;
  }
};

module.exports = (component) => {
  return `
use(function () {
${component.config._AEMCriticalCSSService}
const shouldInject = CSSLoadingService.shouldInject('${component.criticalCSS}');
const cssContent = '<!-- @aem-critical-css: "${component.criticalCSS}" -->\\n${tag[component.injectionType](component)}';
const alreadyInjected = '<!-- @aem-critical-css: "${component.criticalCSS}" already injected -->';
  return {
    inject: shouldInject ? cssContent : alreadyInjected
  }
});
`
};
