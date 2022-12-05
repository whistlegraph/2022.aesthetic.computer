// 🐕‍ Server
// Handles *some* online multiplayer and realtime interaction @ server.aesthetic.computer.
// TODO: Move multiplayer functionality over to session-server but keep this
//       in production for "development" features only? (Research it... 22.12.04.16.06)

// import { createServer } from "http";
// import * as https from "https";
// import { readFileSync } from "fs";
import WebSocket, { WebSocketServer } from "ws";
import ip from "ip";
import chokidar from "chokidar";
import got from "got";
import "dotenv/config";

// ESM
import Fastify from "fastify";
//const fastify = Fastify({ logger: process.env.NODE_ENV === "development" });
const fastify = Fastify({ logger: true });
const server = fastify.server;

// Jamsocket
const jamSocketToken = process.env.JAMSOCKET_ACCESS_TOKEN;

// UDP Server (using Twilio ICE servers)
//const accountSid = process.env.TWILIO_ACCOUNT_SID;
//const authToken = process.env.TWILIO_AUTH_TOKEN;
// See also: https://www.twilio.com/docs/stun-turn/api?code-sample=code-create-a-token-resource&code-language=Node.js&code-sdk-version=3.x#
//import twilio from "twilio";
//const client = twilio(accountSid, authToken);
// console.log(client);
//client.tokens.create({ ttl: 3600 }).then((token) => {
//  console.log("Twilio:", token);
//});

/*
import geckos from "@geckos.io/server";

const io = geckos();

io.listen(3000); // default port is 9208

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`);
  });

  channel.on("chat message", (data) => {
    console.log(`got ${data} from "chat message"`);
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit("chat message", data);
  });
});
*/

// HTTP Server:
// 1. Live Reload Endpoint for Remote Development Mode
// 2. Session Backend Spawning.
const backends = {};

let port = 8080;
const host =  process.env.NODE_ENV === "development" ? "localhost" : "0.0.0.0";
let corsOrigin = "https://aesthetic.computer";
if (process.env.NODE_ENV === "development") {
  corsOrigin = "https://localhost:8888";
  port = 8082;
}

// TODO: Make sure this still works on the piece server? 22.12.02.16.18
fastify.post("/reload", async (req, rep) => {
  everyone(pack("reload", req.body, "pieces"));
  // console.log("Reload!", req.body);
  return { msg: "Reload request sent!", body: req.body };
});

/*
// 1. Live Reload Endpoint.
if (req.method === "POST" && req.url === "/reload") {
  let body = "";
  req.on("data", (data) => (body += data));
  req.on("end", () => {
    res.writeHead(200, { "Content-Type": "application/json" });
    everyone(pack("reload", body, "pieces"));
    res.end(JSON.stringify({ msg: "Reload request sent!" }));
  });
}
*/

// Run server.
const start = async () => {
  try {
    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

await start();

// Web Socket Server
let wss;
const connections = {};

let connectionId = 0; // TODO: Eventually replace with a username arrived at through
//                             a client <-> server authentication function.

if (process.env.NODE_ENV === "development") {
  // Put the development environment behind a local https server.
  // const server = createServer({
  //   cert: readFileSync("../ssl-dev/localhost.pem"),
  //   key: readFileSync("../ssl-dev/localhost-key.pem"),
  // });
  // port = 8083;
  // server.listen(port, () => {
  //   console.log(
  //     `🤖 server.aesthetic.computer (Development) socket: wss://${ip.address()}:${port}`
  //   );
  // });
  wss = new WebSocketServer({ server });
  //wss = new WebSocketServer({ port });
  console.log(
    `🤖 server.aesthetic.computer (Development) socket: ws://${ip.address()}:${port}`
  );
} else {
  // And assume that in production we are already behind an https proxy.
  wss = new WebSocketServer({ server });
  //wss = new WebSocketServer({ port });
  console.log(wss);
  console.log(
    `🤖 server.aesthetic.computer (Production) socket: wss://${ip.address()}:${port}`
  );
}

// Pack messages into a simple object protocol of `{type, content}`.
function pack(type, content, id) {
  return JSON.stringify({ type, content, id });
}

// Construct the server.
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress.slice(7) || "localhost"; // beautify ip

  // Assign the conection a unique id.
  connections[connectionId] = ws;
  const id = connectionId;

  // Send a single welcome message for every new client connection.
  // TODO: This message should be a JSON encoded object and be displayed on
  //       the client instead.
  const content = { ip, id, playerCount: wss.clients.size };

  ws.send(pack("message", JSON.stringify(content), id));

  // Send a message to all other clients except this one.
  function others(string) {
    wss.clients.forEach((c) => {
      if (c !== ws && c.readyState === WebSocket.OPEN) c.send(string);
    });
  }

  others(
    pack(
      "message",
      JSON.stringify({
        text: `${connectionId} has joined from ${ip}. Connections open: ${content.playerCount}`,
      }),
      id
    )
  );

  connectionId += 1;

  // Relay all incoming messages from this client to everyone else.
  ws.on("message", (data) => {
    // Parse incoming message and attach client identifier.
    const msg = JSON.parse(data.toString());
    msg.id = id; // TODO: When sending a server generated message, use a special id.
    // console.log(msg);
    // TODO: Why not always use "others" here?
    everyone(JSON.stringify(msg));
    // others(JSON.stringify(msg));
  });

  //Note: for some reason pinging was disconnecting users over and over again...
  //         TBD: Is pinging even necessary?

  ws.isAlive = true; // For checking persistence between ping-pong messages.

  // Send a ping message to all clients every 30 seconds, and kill
  // the client if it does not respond back with a pong on any given pass.
  const interval = setInterval(function ping() {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  ws.on("pong", () => (ws.isAlive = true)); // Receive a pong.

  // Stop pinging once the socket closes.
  // More info: https://stackoverflow.com/a/49791634/8146077
  ws.on("close", () => {
    everyone(pack("left", { id, count: wss.clients.size }));
    clearInterval(interval);
  });
});

// Sends a message to all connected clients.
function everyone(string) {
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(string);
  });
}

// 🚧 File Watching in Local Development Mode
// TODO: Extend this feature to the SSH server for developers. 22.10.18.21.48
// File watching uses: https://github.com/paulmillr/chokidar
// TODO: Stop logging every file and instead count them up and report a number.
if (process.env.NODE_ENV === "development") {
  // 1. Watch for local file changes in pieces.
  chokidar
    .watch("../system/public/aesthetic.computer/disks")
    .on("all", (event, path) => {
      // console.log("Disk:", event, path);
      if (event === "change") everyone(pack("reload", { piece: "*" }, "local"));
    });

  // 2. Watch base system files.
  chokidar
    .watch([
      "../system/public/aesthetic.computer/lib",
      "../system/public/aesthetic.computer/boot.js",
      "../system/public/aesthetic.computer/bios.js",
      "../system/public/aesthetic.computer/style.css",
    ])
    .on("all", (event, path) => {
      // console.log("System:", event, path);
      if (event === "change")
        everyone(pack("reload", { piece: "*refresh*" }, "local"));
    });
}