import type envSchema from "@/config/env.schema";

export type EnvVarType =
  | "string"
  | "number"
  | "boolean"
  | "url"
  | "email"
  | "json"
  | "enum";

export interface EnvVarValidationSchema {
  type: EnvVarType;
  required?: boolean;
  default?: string | number | boolean;
  enum?: string[];
  pattern?: RegExp;
  description?: string;
  example?: string;
  transform?: (value: string | number | boolean | undefined) => unknown;
}

export type ValidationSchema = Record<string, EnvVarValidationSchema>;

export interface ValidationError {
  variable: string;
  message: string;
  received?: string;
  expected?: string;
}

type InferType<T> = T extends { type: "string" }
  ? string
  : T extends { type: "number" }
  ? number
  : T extends { type: "boolean" }
  ? boolean
  : T extends { type: "url" }
  ? string
  : T extends { type: "email" }
  ? string
  : T extends { type: "json" }
  ? unknown
  : T extends { type: "enum"; enum: readonly string[] }
  ? T["enum"][number]
  : never;

type EnvSchemaType = typeof envSchema;

export type ValidatedEnv = {
  [K in keyof EnvSchemaType]: InferType<EnvSchemaType[K]>;
};
