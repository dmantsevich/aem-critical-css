# AEM Critical CSS 🐝

[Nodejs](https://nodejs.org/en/) tool which helps to build/inject critical/component CSS for [AEM templates/components](https://experienceleague.adobe.com/docs/experience-manager-htl/using/getting-started/getting-started.html?lang=en) ([Adobe Experience Manager](https://www.adobe.com/ru/marketing/experience-manager.html))

![dmantsevich/aem-critical-css](static/up.gif)

## Features 🐿
- [x] Fast, flexible, powerful
- [x] [Configurable](#config-) 
- [x] Inline injection via ``style`` tag
- [x] Standalone injection via ``link`` tag
- [x] Single injection (on the page)
- [x] Auto-resolving injection type by file size
- [x] Hashes for files injected via ``link`` tag
- [x] Supports ``.css``, ``.scss``, ``.sass``, ``.less`` files
- [x] Partial injection (css depends on component configuration)
- [x] Tested on several AEM projects
- [x] etc.

## Regular Workflow 🐉
1. Tool is searching all ``"*.html"`` files ([HTL](https://experienceleague.adobe.com/docs/experience-manager-htl/using/htl/block-statements.html?lang=en#overview)) under ``${config.AEM.components}`` (by default: **ui.apps/src/main/content/jcr_root/apps/** folder | see [config](#config-)) folder
2. Analyzing all found files, which contains ``${criticalCSS.file}.${criticalCSS.type}`` (by default: **_aem-critical-css.js** string | see [config](#config-)) string. 
3. Parsing ``${config.criticalCSS.sourceAttr}``, ``${config.criticalCSS.injectionTypeAttr}``, ``${config.criticalCSS.serviceAttr}`` attributes. (by default: **@aem-critical-css**, **@aem-critical-css-injectiontype**, **@aem-critical-css-service** attributes | see [config](#config-))
4. If parsing was successful, then starts _generating CSS code_ linked in ``${config.criticalCSS.sourceAttr}`` (by default: **@aem-critical-css** attribute | see [config](#config-)) attribute.
    - Reading source ``${config.css.sourceRoot}/${@aem-critical-css-attribute-value}`` file (by default: **./${aem-critical-css-attribute-value}** | see [config](#config-))
    - Compile source file with **[less](https://www.npmjs.com/package/less)**, **[node-sass](https://www.npmjs.com/package/node-sass)** compiler
    - Process CSS with [postcss](https://www.npmjs.com/package/postcss) plugins (by default: **autoprefixer**, **cssnano** | see [config](#config-))
5. Resolve injection type
    - If **${config.criticalCSS.injectionTypeAttr}** attribute (by default: **@aem-critical-css-injectiontype** | see [config](#config-)) is defined, then it will be used
    - Otherwise **${config.criticalCSS.injectionType}** value (by default: **auto** | see [config](#config-)) will be used
    - Resolving for injection type **auto**:
        - Calculating _filesize_ for generated CSS file (after gzip)
        - If _filesize_ is lower ``${config.criticalCSS.gzipSize}`` (by default: **10kb** | see [config](#config-)) then file will be injected via ``<style>`` tag.
        - Otherwise file will be injected via ``<link>`` tag.
6. If injection type is **link**, then css file(file name will contains hash) will be saved under **${config.web.localClientlib}/resources/** folder (by default: **ui.apps/src/main/content/jcr_root/apps/aem-critical-css/resources/** | see [config](#config-))
7. Generating ``${criticalCSS.file}.${criticalCSS.type}`` (by default: **_aem-critical-css.js** | see [config](#config-)) file in the same folder with [HTL template](https://experienceleague.adobe.com/docs/experience-manager-htl/using/htl/block-statements.html?lang=en#overview) (where it used).
    


## Install 🐠
1) Install **[NodeJs](https://nodejs.org/en/)** (This will also install **[npm](https://www.npmjs.com/)**)
2) Install [@dmantsevich/aem-critical-css](https://www.npmjs.com/package/@dmantsevich/aem-critical-css) as dependency for your project (👍):
```shell script
npm i @dmantsevich/aem-critical-css --save
```

## How to use 🐟
Should helps to understand how it use 
TBD

## API 🦔
Should helps to integrate with your build process
TBD

## Config 🦖
Should helps to configure your build process
TBD

## Partial CSS injection 🐇
Should helps to split & inject only necessary CSS for your component (depends on component configuration)  
TBD 

## Custom Services
Will describe how to create own service
TBD

## Best practice 🦗
- Add **_aem-critical-css.js**, **_aem-critical-css.html** files (see [config](#config-)) to your [.gitignore](https://github.com/github/gitignore) file
- Add **ui.apps/src/main/content/jcr_root/apps/aem-critical-css/** folder (see [config](#config-)) to your [.gitignore](https://github.com/github/gitignore) file
TBD

## FAQ 🦆
Most popular questions/answers will be here
TBD


## Roadmap 🦙
TBD

## Links 🐙

[![@dmantsevich/aem-critical-css](static/npm-logo.png)](https://www.npmjs.com/package/@dmantsevich/aem-critical-css)

[![dmantsevich/aem-critical-css](static/github-logo.png)](https://github.com/dmantsevich/aem-critical-css)


🧰 

---
**2021**