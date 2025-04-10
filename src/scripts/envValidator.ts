import envSchema from "@/config/env.schema";
import dotenv from "dotenv"
import EnvironmentValidator from "@/lib/envValidator/validator.envValidator";
dotenv.configDotenv({ path: process.cwd() + "/.env.local" })
new EnvironmentValidator(envSchema).validate()

