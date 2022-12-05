// Session Server, 22.12.04.14.57
// Represents a "room" or user or "client" backend
// which at the moment is run once for every "piece"
// that requests it.

/* #region todo 📓 
 - [] Add sockets back.
 + Done
 - [x] Make a "local" option.
#endregion */

import Fastify from "fastify";

const dev = process.env.NODE_ENV === "development";
const fastify = Fastify({ logger: dev });
const server = fastify.server;

const info = {
  port: process.env.PORT, // 8889 in development via `package.json`
  name: process.env.SPAWNER_NAME,
  url: process.env.SPAWNER_URL,
  service: process.env.SPAWNER_SERVICE,
};

// *** Routing ***
fastify.get("/test", async (req, rep) => {
  rep.send({ msg: "Test complete 😃" });
});

// *** Server Initialization ***
const start = async () => {
  try {
    //await fastify.listen({ port: info.port, host: "0.0.0.0" });
    fastify.listen({ port: info.port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

await start();