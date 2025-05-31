import logger from "@/logger";
import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const ServerErrorHandler = (error: FastifyError & { events: unknown }, request: FastifyRequest, reply: FastifyReply) => {
  console.log(error);
  logger.system.error(error);
  if (error.events) reply.status(422).send({ ...error });
  else reply.status(500).send({ ok: false });
};

export default ServerErrorHandler;
