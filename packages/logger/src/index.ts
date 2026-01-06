import winston from "winston";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "http",
  levels: winston.config.npm.levels,
  format: logFormat,
  transports: [
    // Write all logs with level 'error' and below ('warn', 'info', 'verbose', 'debug', 'silly') to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
    // Write all logs error (and above) to error.log
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a separate logger for requests
const requestLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "http",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/requests.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Request logging middleware
export const requestLoggerMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    requestLogger.info(`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      contentLength: res.get("content-length"),
      userAgent: req.get("user-agent"),
      ip: req.ip,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

// Export the main logger
export default logger;

// Export specific log levels as convenience functions
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};
