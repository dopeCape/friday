import type {
  EnvVarType,
  EnvVarValidationSchema,
  ValidatedEnv,
  ValidationError,
  ValidationSchema,
} from "@/types";
import dotenv from "dotenv"
dotenv.configDotenv({ path: "/home/baby/workflow/projects/friday/.env.local" })

class EnvironmentValidator {
  private schema: ValidationSchema;
  private errors: ValidationError[] = [];
  private validatedEnv: Record<string, unknown> = {};

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  private validateType(
    value: string,
    type: EnvVarType,
    enumValues?: string[],
  ): { isValid: boolean; transformed?: string | number | boolean | undefined } {
    try {
      switch (type) {
        case "string":
          return { isValid: true, transformed: value };

        case "number":
          const num = Number(value);
          return {
            isValid: !isNaN(num),
            transformed: num,
          };

        case "boolean":
          const lower = value.toLowerCase();
          if (!["true", "false", "1", "0"].includes(lower)) {
            return { isValid: false };
          }
          return {
            isValid: true,
            transformed: ["true", "1"].includes(lower),
          };

        case "url":
          try {
            new URL(value);
            return { isValid: true, transformed: value };
          } catch {
            return { isValid: false };
          }

        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return {
            isValid: emailRegex.test(value),
            transformed: value,
          };

        case "json":
          try {
            const parsed = JSON.parse(value);
            return { isValid: true, transformed: parsed };
          } catch {
            return { isValid: false };
          }

        case "enum":
          if (!enumValues) return { isValid: false };
          return {
            isValid: enumValues.includes(value),
            transformed: value,
          };

        default:
          return { isValid: false };
      }
    } catch {
      return { isValid: false };
    }
  }

  private validateVariable(name: string, schema: EnvVarValidationSchema): void {
    const value = process.env[name];
    if (schema.required && !value && !schema.default) {
      this.errors.push({
        variable: name,
        message: `Required environment variable "${name}" is missing`,
      });
      return;
    }

    const actualValue = value ?? schema.default;
    if (!actualValue) return;

    const { isValid, transformed } = this.validateType(
      String(actualValue),
      schema.type,
      schema.enum,
    );

    if (!isValid) {
      this.errors.push({
        variable: name,
        message: `Invalid type for "${name}"`,
        received: typeof actualValue,
        expected: schema.type,
      });
      return;
    }

    if (schema.pattern && !schema.pattern.test(String(actualValue))) {
      this.errors.push({
        variable: name,
        message: `Invalid format for "${name}"`,
        received: String(actualValue),
        expected: schema.pattern.toString(),
      });
      return;
    }

    this.validatedEnv[name] = (schema.transform
      ? schema.transform(transformed)
      : transformed);
  }

  public validate(): ValidatedEnv {
    this.errors = [];
    this.validatedEnv = {};

    Object.entries(this.schema).forEach(([name, schema]) => {
      this.validateVariable(name, schema);
    });

    if (this.errors.length > 0) {
      const errorReport = this.generateErrorReport();
      throw new Error(errorReport);
    }

    return this.validatedEnv as ValidatedEnv;
  }

  private generateErrorReport(): string {
    const lines = [
      "🚨 Environment Variable Validation Failed",
      "==========================================",
      "",
      "❌ Validation Errors:",
      ...this.errors.map(
        (err) =>
          `  • ${err.variable}: ${err.message}` +
          (err.received ? ` (Received: ${err.received})` : "") +
          (err.expected ? ` (Expected: ${err.expected})` : ""),
      ),
      "",
      "📝 Required Environment Variables:",
      ...Object.entries(this.schema)
        .filter(([, schema]) => schema.required)
        .map(
          ([name, schema]) =>
            `  • ${name}: ${schema.type}` +
            (schema.description ? ` - ${schema.description}` : "") +
            (schema.example ? ` (Example: ${schema.example})` : ""),
        ),
      "",
      "💡 Make sure all required variables are set in your .env file",
    ];

    return lines.join("\n");
  }
}
export default EnvironmentValidator

