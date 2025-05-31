import logger from "@/logger";
import { server } from "@/server";

const ServerReadyHandler = async (err: Error | null) => {
  try {
    if (err) throw err;
    logger.system.info("Server fully setup and ready");
    process.on("SIGINT", () => process.exit(1));
  } catch (e) {
    console.log("wtf", e);
  }
};

export default ServerReadyHandler;
