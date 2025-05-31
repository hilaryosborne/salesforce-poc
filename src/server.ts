import { config } from "dotenv";

config();

import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import logger from "@/logger";
import ServerHealthHandler from "./module.server/server.health/server.health.handler";
import ServerListenHandler from "./module.server/server.listen/server.listen.handler";
import SalesForceHttpHandler from "./module.salesforce/salesforce.http.handler";

export const server = fastify({ logger: true, bodyLimit: 30 * 1024 * 1024 });

const main = async () => {
  try {
    server.register(multipart);
    // server.register(cors, { origin: process.env.CLIENT_CORS_ORIGIN });
    server.get("/health", ServerHealthHandler);
    server.get("/", SalesForceHttpHandler);
    server.listen({ port: process.env.SERVER_PORT || 3000, host: "0.0.0.0" }, ServerListenHandler);
    process.stdin.resume();
    process.on("SIGINT", () => process.exit(1));
  } catch (e) {
    console.log("wtf", e);
  }
};

main()
  .then(() => logger.system.info("tutelage api server started"))
  .catch((err) => logger.system.error(err));
