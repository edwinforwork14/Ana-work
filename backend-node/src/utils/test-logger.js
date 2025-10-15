const logger = require('./logger');
logger.debug('Mensaje DEBUG de prueba', { userId: 42, action: 'test' });
logger.info('Mensaje INFO de prueba', { env: process.env.NODE_ENV || 'undefined' });
logger.error('Mensaje ERROR de prueba', new Error('Algo salió mal'));