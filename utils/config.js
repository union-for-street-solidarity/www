const Joi = require('joi');
const path = require('path');
// require and configure dotenv, will load vars in .env in PROCESS.ENV
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });
// define validation for all the env vars
const envVarsSchema = Joi.object({
  PORT: Joi.string(),
  NODE_ENV: Joi.string(),
  SECRET: Joi.string(),
  MONGOURL: Joi.string(),
  FULLMONGOURL: Joi.string(),
  DBNAME: Joi.string(),
  COLLECTION: Joi.string(),
  SERVER_ADDRESS: Joi.string(),
  SERVER_PORT: Joi.string(),
  AUTH_USER: Joi.string(),
  AUTH_PASSWORD: Joi.string(),
  ADMIN: Joi.string()
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  port: envVars.PORT,
  env: envVars.NODE_ENV,
	secret: envVars.SECRET,
	mongoUrl: envVars.MONGOURL,
  fullMongoUrl: envVars.FULLMONGOURL,
  dbName: envVars.DBNAME,
  collection: envVars.COLLECTION,
  serverAddress: envVars.SERVER_ADDRESS,
  serverPort: envVars.SERVER_PORT,
  authUser: envVars.AUTH_USER,
  authPassword: envVars.AUTH_PASSWORD,
	admin: envVars.ADMIN
};

module.exports = config;
