import logger from "@/logger";

const ServerListenHandler = async (err: Error | null, address: string) => {
  if (!err) logger.system.info(`Server listening at ${address}`);
  else logger.system.error(err) && process.exit(1);
};

export default ServerListenHandler;
