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
<sly data-sly-template.inject>
    <sly data-sly-use.service="\${'${component.config.criticalCSS.useAPIServiceJCRPath}' @ css='${component.criticalCSS}'}"/>
    <sly data-sly-test="\${service.shouldInject}">
      <!-- @aem-critical-css: "${component.criticalCSS}" -->
      ${tag[component.injectionType](component)}      
    </sly>
    <sly data-sly-test="\${!service.shouldInject}">
      <!-- @aem-critical-css: "${component.criticalCSS}" already injected -->
    </sly>
</sly>
`
}
