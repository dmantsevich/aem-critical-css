module.exports = (options = {}) => {
  return `
[IMPORTANT]

[Date] ${new Date().toISOString()}
${Object.keys(options).map((key) => `[${key}] ${options[key]}`).join('\n')}

[Description] 
That file was generated automatically during build process.
Don't modify it. File will be overridden after next build.

[Read More]
https://github.com/dmantsevich/aem-critical-css
https://www.npmjs.com/package/@dmantsevich/aem-critical-css
`;
};