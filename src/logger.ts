import winston from "winston";

const createLogger = (label: string) => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, label, meta }) => {
        return meta ? `${timestamp} [${label}] ${level}: ${message} ${meta}` : `${timestamp} [${label}] ${level}: ${message}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });
};

const system = createLogger("system");

const database = createLogger("database");

const automate = createLogger("automate");

export default { create: createLogger, system, database, automate };
