import type { LogLevel, LogMetadata } from "@/types";
import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";
import {
  createLogger,
  type Logger as WinstonLogger,
  type transport,
  transports,
  format,
} from "winston";
import chalk from "chalk";
import { ContextStore } from "@/lib/context/contextStore";
import env from "@/config/env.config";

export class Logger {
  private static instance: Logger;
  private readonly logger: WinstonLogger;
  private readonly contextStore: ContextStore;

  private readonly consoleFormat = format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format((info) => {
      const context = this.contextStore.getContext();
      if (context) {
        info.metadata = {
          ...context,
          ...(info.metadata as Record<string, unknown>),
        };
      }

      const { level, message, metadata } = info;
      const colorMap: Record<LogLevel, (text: string) => string> = {
        error: (text) => chalk.red.bold(text),
        warn: (text) => chalk.yellow.bold(text),
        info: (text) => chalk.blue.bold(text),
        debug: (text) => chalk.green.bold(text),
      };

      const colorizer = colorMap[level as LogLevel];
      if (colorizer) {
        info.coloredLevel = colorizer(level);
        info.coloredMessage = colorizer(message as string);
      }

      info.formattedMetadata =
        metadata && Object.keys(metadata).length > 0
          ? chalk.gray("\n" + JSON.stringify(metadata, null, 2))
          : "";

      return info;
    })(),
    format.printf((info) => {
      return `[${chalk.gray(info.timestamp)}] ${info.coloredLevel}: ${info.coloredMessage
        }${info.formattedMetadata}`;
    }),
  );

  private readonly axiomFormat = format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format((info) => {
      const context = this.contextStore.getContext();
      if (context) {
        info.metadata = {
          ...context,
          ...(info.metadata as Record<string, unknown>),
        };
      }
      return info;
    })(),
    format.json(),
  );

  private constructor() {
    const environment = env.NODE_ENV;
    this.contextStore = ContextStore.getInstance();

    const consoleTransport = new transports.Console({
      format: this.consoleFormat,
    });

    const winstonTransports: transport[] = [consoleTransport];
    //TODO: configer logger to push debug logs only when the env is development
    if (environment === "production" || environment === "staging") {
      const axiomTransport = new AxiomTransport({
        token: env.AXIOM_TOKEN,
        dataset: env.AXIOM_DATASET,
        format: this.axiomFormat,
      });
      winstonTransports.push(axiomTransport);
    }

    if (environment === "development") {
      winstonTransports.push(
        new transports.File({ filename: "logs.log", format: this.axiomFormat }),
      );
    }

    this.logger = createLogger({
      transports: winstonTransports,
      level: environment === "production" ? "info" : "debug",
      exitOnError: false,
    });
  }

  public static getInstance(): Logger {
    const instance = Logger.instance;
    if (!instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public error(message: string, metadata: LogMetadata = {}): void {
    this.logger.error({ message, metadata });
  }

  public warn(message: string, metadata: LogMetadata = {}): void {
    this.logger.warn({ message, metadata });
  }

  public info(message: string, metadata: LogMetadata = {}): void {
    this.logger.info({ message, metadata });
  }

  public debug(message: string, metadata: LogMetadata = {}): void {
    this.logger.debug({ message, metadata });
  }

}
