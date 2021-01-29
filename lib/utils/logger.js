const { Logger } = require('@dmantsevich/colorful-semantic-logger');
const logger = new Logger('AEM Critical CSS', { headerFormat: '<time.now/> <level/> <loggerName/>:' });

module.exports = logger;