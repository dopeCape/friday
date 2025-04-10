import type winston from "winston";

export type LogLevel = "error" | "warn" | "info" | "debug";
export interface LogMetadata {
  [key: string]: unknown;
}
export interface LogInfo extends winston.Logform.TransformableInfo {
  timestamp?: string;
  level: string;
  message: string;
  metadata?: LogMetadata;
  coloredLevel?: string;
  coloredMessage?: string;
  formattedMetadata?: string;
}

export type LoggerMethods = {
  error: (message: string, metadata: LogMetadata) => void;
  log: (message: string, metadata: LogMetadata) => void;
  warn: (message: string, metadata: LogMetadata) => void;
};

export type Env = "development" | "production" | "test";

export interface LogMetadata extends Record<string, unknown> {
  timestamp?: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  sevrity?: Sevrity;
}

export interface RequestContext {
  requestId: string;
  userId?: string;
  tenantId?: string;
  path?: string;
  method?: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface ColoredInfo {
  level: string;
  message: string;
  metadata?: LogMetadata;
  timestamp?: string;
  coloredLevel?: string;
  coloredMessage?: string;
  formattedMetadata?: string;
}

export enum Sevrity {
  HIGH,
  MODRATE,
  LOW,
}
