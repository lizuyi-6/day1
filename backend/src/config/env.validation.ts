import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),

  PORT: Joi.number().default(3001).description('Server port'),

  // Database configuration
  // SQLite 配置（推荐用于开发环境）
  DB_PATH: Joi.string()
    .default('data/aether_flow.db')
    .description('SQLite database file path'),

  // PostgreSQL 配置（可选，用于生产环境）
  DB_HOST: Joi.string()
    .optional()
    .description('Database host (PostgreSQL only)'),

  DB_PORT: Joi.number()
    .default(5432)
    .description('Database port (PostgreSQL only)'),

  DB_USERNAME: Joi.string()
    .optional()
    .description('Database username (PostgreSQL only)'),

  DB_PASSWORD: Joi.string()
    .min(12)
    .optional()
    .description('Database password (PostgreSQL only)'),

  DB_NAME: Joi.string()
    .optional()
    .description('Database name (PostgreSQL only)'),

  DB_SYNCHRONIZE: Joi.boolean()
    .default(true)
    .description('Auto-sync database schema'),

  DB_LOGGING: Joi.boolean()
    .default(false)
    .description('Enable database query logging'),

  // JWT configuration
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret key (minimum 32 characters)'),

  JWT_EXPIRATION: Joi.string()
    .default('7d')
    .description('JWT token expiration time'),

  // OpenAI/LM configuration
  OPENAI_API_KEY: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .description('OpenAI API key'),

  OPENAI_MODEL: Joi.string()
    .default('gpt-3.5-turbo')
    .description('Default OpenAI model'),

  OPENAI_MAX_TOKENS: Joi.number()
    .default(2000)
    .description('Maximum tokens for OpenAI responses'),

  OPENAI_TEMPERATURE: Joi.number()
    .min(0)
    .max(2)
    .default(0.7)
    .description('OpenAI temperature'),

  // CORS configuration
  ALLOWED_ORIGINS: Joi.string()
    .required()
    .description('Comma-separated list of allowed CORS origins'),

  // Rate limiting
  RATE_LIMIT_TTL: Joi.number()
    .default(60)
    .description('Rate limit time-to-live in seconds'),

  RATE_LIMIT_MAX: Joi.number()
    .default(100)
    .description('Maximum requests per rate limit window'),

  // Throttler configuration
  THROTTLE_TTL: Joi.number()
    .default(60000)
    .description('Throttler time-to-live in milliseconds'),

  THROTTLE_LIMIT: Joi.number()
    .default(100)
    .description('Throttler limit requests'),

  // Redis configuration (optional)
  REDIS_HOST: Joi.string().optional().description('Redis host'),

  REDIS_PORT: Joi.number().default(6379).description('Redis port'),

  REDIS_PASSWORD: Joi.string().optional().description('Redis password'),

  // Workflow execution limits
  MAX_WORKFLOW_STEPS: Joi.number()
    .default(100)
    .description('Maximum steps in workflow execution'),

  WORKFLOW_TIMEOUT: Joi.number()
    .default(30000)
    .description('Workflow execution timeout in milliseconds'),

  // File upload configuration
  MAX_FILE_SIZE: Joi.number()
    .default(10485760)
    .description('Maximum file upload size in bytes (default 10MB)'),

  // Logging configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info')
    .description('Application log level'),

  // Application metadata
  APP_NAME: Joi.string()
    .default('Workflow Engine')
    .description('Application name'),

  APP_VERSION: Joi.string().default('1.0.0').description('Application version'),

  APP_URL: Joi.string().uri().optional().description('Application public URL'),
});
