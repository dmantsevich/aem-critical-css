const filesize = require('filesize');
const { Logger } = require('@dmantsevich/colorful-semantic-logger');

let PHASE = 0;

const logger = new Logger('AEM Critical CSS', {
  headerFormat: '<time.now/> <level/> <loggerName/>:',
  semanticData: {
    tags: {
      'filesize': (size, logger) => logger._paint(filesize(size), 'blue'),
      'fn': (fn, logger) => logger._paint(fn, 'cyan'),
      'phase': (phase, logger) => logger._paint(logger._paint(` Phase ${PHASE++}. ${phase} `, 'bgCyan'), 'black')
    }
  }
});

module.exports = logger;