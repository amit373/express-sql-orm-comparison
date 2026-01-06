// Application configuration
import { validateEnv } from "@packages/validation";

// Validate environment variables
const env = validateEnv();

// Application configuration
const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "24h",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  logLevel: env.LOG_LEVEL,
};

export default config;

// Export specific configuration values
export const getPort = () => config.port;
export const getDatabaseUrl = () => config.database.url;
export const getNodeEnv = () => config.env;
export const getJwtSecret = () => config.jwt.secret;
export const getCorsOptions = () => config.cors;
export const getRateLimitOptions = () => config.rateLimit;
export const getLogLevel = () => config.logLevel;
