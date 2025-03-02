import winston from 'winston';

// Create a logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for errors
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

// Add a stream for Morgan middleware
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Override console methods to use the logger
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args) => {
  logger.info(args.join(' '));
  originalConsoleLog(...args);
};

console.error = (...args) => {
  logger.error(args.join(' '));
  originalConsoleError(...args);
};

console.warn = (...args) => {
  logger.warn(args.join(' '));
  originalConsoleWarn(...args);
};

console.info = (...args) => {
  logger.info(args.join(' '));
  originalConsoleInfo(...args);
};