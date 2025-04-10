import type { ValidatedEnv } from "../types/index";
import EnvironmentValidator from "@/lib/envValidator/validator.envValidator";
import envSchema from "@/config/env.schema";

/**
 * Manages environment configuration using the Singleton pattern
 * @description Provides validated environment variables through a single,
 * immutable instance to ensure consistent configuration across the application
 */
class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private env: ValidatedEnv;

  /**
   * Private constructor enforcing singleton pattern
   * Validates environment variables against schema during initialization
   * @throws {ValidationError} If environment variables don't match schema
   */
  private constructor() {
    this.env = new EnvironmentValidator(envSchema).validate();
  }

  /**
   * Gets or creates the singleton instance of EnvironmentConfig
   * @returns The singleton instance of EnvironmentConfig
   * @example
   * const envConfig = EnvironmentConfig.getInstance();
   */
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Returns a frozen copy of the validated environment configuration
   * @returns Immutable environment configuration object
   * @description Returns a deep copy of the environment variables to prevent
   * accidental modifications. The returned object is frozen using Object.freeze()
   * @example
   * const config = EnvironmentConfig.getInstance().getConfig();
   * console.log(config.PORT); // Access environment variables
   */
  public getConfig(): Readonly<ValidatedEnv> {
    return Object.freeze({ ...this.env });
  }
}

/**
 * Exports a singleton instance of the validated environment configuration
 * @constant
 * @type {Readonly<ValidatedEnv>}
 * @example
 * import env from './environment.config';
 * console.log(env.DATABASE_URL);
 */
const env = EnvironmentConfig.getInstance().getConfig();
export default env;
