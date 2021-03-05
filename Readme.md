# AEM Critical CSS 🐝

[Nodejs](https://nodejs.org/en/) tool which helps to build/inject critical/component CSS for [AEM templates/components](https://experienceleague.adobe.com/docs/experience-manager-htl/using/getting-started/getting-started.html?lang=en) ([Adobe Experience Manager](https://www.adobe.com/ru/marketing/experience-manager.html)).

It can be used as components CSS dependency resolver/injector (not as automatically code splitter/extractor).  

![dmantsevich/aem-critical-css](static/up.gif)

## Table of contents 👈🏻
- [Install](#install-)
- [How to use](#how-to-use-)
- [Regular Workflow](#regular-workflow-)
- [API](#api-)
- [Config](#config-)
    - [Injection type - Inline](#injection-type---inline-as-a-part-of-html)
    - [Injection type - Link](#injection-type---link-as-a-css-file)
- [Best practice](#best-practice-)
- [FAQ](#faq-)
- [Links](#links-)

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


## Install 🐠
1) Install **[NodeJs](https://nodejs.org/en/)** (This will also install **[npm](https://www.npmjs.com/)**)
2) Install [@dmantsevich/aem-critical-css](https://www.npmjs.com/package/@dmantsevich/aem-critical-css) as dependency for your project (👍):
```shell script
npm i @dmantsevich/aem-critical-css --save
```


## How to use 🐟
That section shows basic usage for beginners.
1. Open AEM component template and add next code (where _"path/to/component-css.less"_ is path to critical css file, which should be injected. Path is related to ``${config.css.sourceRoot}`` (see [config](#config-)). Supports: **less**, **scss**, **sass**, **css** types):
```html
<sly data-sly-use.aemCriticalCSS="${'./_aem-critical-css.js'}"
	@aem-critical-css="path/to/component-css.less">${aemCriticalCSS.inject @ context="unsafe"}</sly>
```
2. Go to folder where frontend team are working (``cd ui.frontend`` or ``cd ui.clientlibs`` or other)
3. Install [AEM Critical CSS](https://www.npmjs.com/package/@dmantsevich/aem-critical-css) module/package as dependency (see [Install](#install-) section):
```shell script
npm i @dmantsevich/aem-critical-css --save
``` 
4. Create ``aem-critical-css.js`` file (in the future webpack, gulp & grunt wrappers will be added) with code:
```js
const { process } = require('@dmantsevich/aem-critical-css');
const config = {}; // it is configuration for the project
process(config);
```
5. Process templates (see [Regular Workflow](#regular-workflow-) section) (it should be a part of frontend build):
```shell script
node aem-critical-css.js
```
6. If processing was successful, then you can find generated css file (_aem-critical-css.js_) near AEM component template.
7. You can deploy code to AEM


## Regular Workflow 🐉
1. Tool is searching all ``"*.html"`` files ([HTL](https://experienceleague.adobe.com/docs/experience-manager-htl/using/htl/block-statements.html?lang=en#overview)) under ``${config.AEM.components}`` (by default: **ui.apps/src/main/content/jcr_root/apps/** folder | see [config](#config-)) folder
2. Analyzing all found files, which contains ``${criticalCSS.file}.${criticalCSS.type}`` (by default: **_aem-critical-css.js** string | see [config](#config-)) string. 
3. Parsing ``${config.criticalCSS.sourceAttr}``, ``${config.criticalCSS.injectionTypeAttr}``, ``${config.criticalCSS.serviceAttr}`` attributes. (by default: **@aem-critical-css**, **@aem-critical-css-injectiontype**, **@aem-critical-css-service** attributes | see [config](#config-))
4. If parsing was successful, then starts _generating CSS code_ linked in ``${config.criticalCSS.sourceAttr}`` (by default: **@aem-critical-css** attribute | see [config](#config-)) attribute.
    - Reading source ``${config.css.sourceRoot}/${@aem-critical-css-attribute-value}`` file (by default: **./${aem-critical-css-attribute-value}** | see [config](#config-))
    - Compile source file with **[less](https://www.npmjs.com/package/less)**, **[node-sass](https://www.npmjs.com/package/node-sass)** compiler (you can create your custom compiler)
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


## API 🦔
Next properties & method exports [@dmantsevich/aem-critical-css](https://www.npmjs.com/package/@dmantsevich/aem-critical-css) module:
- **process(config)** _{function}_ - process AEM templates & generate css files for injection.
- **CRITICAL_CSS_TYPES** _{constants}_ - contains possible types for critical css files. Uses in configuration ``${config.criticalCSS.type}``. See [config](#config-) section
    - **CRITICAL_CSS_TYPES.TEMPLATE** - generate [HTL](https://experienceleague.adobe.com/docs/experience-manager-htl/using/getting-started/getting-started.html?lang=en#getting-started) files.
    - **CRITICAL_CSS_TYPES.USEAPI** - generate [JS](https://experienceleague.adobe.com/docs/experience-manager-htl/using/htl/use-api-javascript.html?lang=en#a-simple-example) files.
- **INJECTION_TYPES** _{constants}_ - contains possible values for configuration ``${config.criticalCSS.injectionType}``. Also that values can be used in "**@aem-critical-css-inectiontype**" attribute.
    - **INJECTION_TYPES.INLINE** - inject css with ``<style>`` tag. (see [Injection type - Inline](#injection-type---inline-as-a-part-of-html)) 
    - **INJECTION_TYPES.LINK** -  inject css with ``<link href="....">`` tag. (see [Injection type - Link](#injection-type---link-as-a-css-file))
    - **INJECTION_TYPES.AUTO** -  resolve injection type automatically. By default, if _filesize_(after gzip) is lower **10kb**, then **INLINE** type will be used, otherwise **LINK**. See [config](#config-) section


## Config 🦖
Default config file here: [/main/lib/config.js](https://github.com/dmantsevich/aem-critical-css/blob/main/lib/config.js)

| Property        | Type           | Description  |
| ------------- |:-------------:| -----:|
| `AEM.projectRoot`     | *String* | Path to AEM Project root folder. Default value: `./../`(parent folder) |
| `AEM.components`     | *String* | Path to [HTL templates](https://experienceleague.adobe.com/docs/experience-manager-htl/using/getting-started/getting-started.html?lang=en#blocks-and-expressions) which should be processed. Path should be relative to `${config.AEM.projectRoot}`. Default value: `ui.apps/src/main/content/jcr_root/apps/` |
| `criticalCSS.file`     | *String* | Name for output(generated) files. Result filename: `${config.criticalCSS.file}.${config.criticalCSS.type}`. See [Regular Workflow](#regular-workflow-) section. Default value: `_aem-critical-css` |
| `criticalCSS.type`     | *[CRITICAL_CSS_TYPES.USEAPI](#api-) / [CRITICAL_CSS_TYPES.TEMPLATE](#api-)* | Output file type. Default value: `CRITICAL_CSS_TYPES.USEAPI` |
| `criticalCSS.injectionType`     |  *[INJECTION_TYPES.AUTO](#api-) / [INJECTION_TYPES.INLINE](#api-) / [INJECTION_TYPES.LINK](#api-)* | Default injection type (if `@aem-critical-css-injectiontype` attribute isn't defined). Default value: `INJECTION_TYPES.AUTO`  |
| `criticalCSS.injectionTypeAutoResolver`     | *Function(**criticalCSSDefObj**)* | Function-Resolver for `INJECTION_TYPES.AUTO`. Calling for each AEM Critical CSS definition. Should return `INJECTION_TYPES.INLINE` or `INJECTION_TYPES.LINK`. By default: based on CSS GZip size(`getGzip(css) < config.criticalCSS.gzipSize ? INJECTION_TYPES.INLINE : INJECTION_TYPES.LINK`). See `criticalCSS.gzipSize` option.  |
| `criticalCSS.gzipSize`     | *Integer* | Default value: **10kb**. If CSS GZip size lower than is value, then css will be injected - `INJECTION_TYPES.INLINE`. Otherwise: `INJECTION_TYPES.LINK`. Working only with default `criticalCSS.injectionTypeAutoResolver` |
| `criticalCSS.sourceAttr`     | *String* |  Attribute with path to css source file. Default value: `@aem-critical-css` |
| `criticalCSS.injectionTypeAttr`     | *String* |  Attribute with injection type configuration. If attribute isn't present, then `criticalCSS.injectionType` value will be used. Default value: `@aem-critical-css-injectiontype` |
| `criticalCSS.serviceAttr`     | *String* |  Attribute with path (should be relative to jcr_root) to custom injector service. Default value: `@aem-critical-css-service`. Level: _Expert_. |
| `criticalCSS.useAPIService`     | *String* | Path (should be relative to jcr_root) to default JS/Java css injector service. By default: **built-in service** ([AEMCriticalCSSService.js](https://github.com/dmantsevich/aem-critical-css/blob/main/lib/aem-critical-css/AEMCriticalCSSService.js)). Level: _Expert_. |
| `criticalCSS.AEMCriticalCSSServiceDestination`     | *String* | Path, where build-in ([AEMCriticalCSSService.js](https://github.com/dmantsevich/aem-critical-css/blob/main/lib/aem-critical-css/AEMCriticalCSSService.js)) file will be saved. Default value: `ui.apps/src/main/content/jcr_root/apps/aem-critical-css/utils/`. Level: _Expert_. |
| `criticalCSS.minifyOutput`     | *Boolean* | Minify output(for generated _aem-critical-css.html, _aem-critical-css.js files). Default value: `true` |



### Injection type - Inline (as a part of HTML)
For **small or important(critical)** css files, that type is more - preferable. Because request to small files can be bigger (+ non-blocking rendition), than css content.

HTML output for component/critical css file will be (just example):
```html
<!-- @aem-critical-css: path/to/component-css.less -->
<style>/*2021-2-21 0:49:06*/.my-component{border:1px solid red}.my-component a{border:1px solid green}</style>
``` 

### Injection type - Link (as a css file)
That type is better for rarely used components on site pages. That files can be cached in user browser.

HTML output for component/critical css file will be (just example):
```html
<!-- @aem-critical-css: path/to/component-css.less -->
<link href="/etc.clientlibs/aem-critical-css/resources/path/to/component-css.1ha51609gjk2.css" rel="stylesheet"/>
```


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
If you have any questions or you need help, feel free to ask via github: [Issues](https://github.com/dmantsevich/aem-critical-css/issues)

Most popular questions/answers will be here

TBD


## Roadmap 🦙
TBD

## Links 🐙

[![@dmantsevich/aem-critical-css](static/npm-logo.png)](https://www.npmjs.com/package/@dmantsevich/aem-critical-css)

[![dmantsevich/aem-critical-css](static/github-logo.png)](https://github.com/dmantsevich/aem-critical-css)

[![Adobe Experience Manager](static/AEM-logo.png)](https://www.adobe.com/ru/marketing/experience-manager.html)


🧰 

---
**2021**