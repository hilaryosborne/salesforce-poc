import { FastifyRequest } from "fastify";
import { ContentTypeParserDoneFunction } from "fastify/types/content-type-parser";
import zlib from "zlib";

const serverContentTypeParser = (req: FastifyRequest, body: string | Buffer, done: ContentTypeParserDoneFunction) => {
  if (req.headers["content-encoding"] && req.headers["content-encoding"] === "gzip") {
    zlib.gunzip(body, function (err, dezipped) {
      if (err) done(err, null);
      else done(err, JSON.parse(dezipped.toString("utf-8")));
    });
  } else {
    done(null, JSON.parse(body.toString("utf-8")));
  }
};

export default serverContentTypeParser;
