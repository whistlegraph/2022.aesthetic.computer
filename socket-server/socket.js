// 🐕‍ Server
// Handles online multiplayer and realtime interaction @ server.aesthetic.computer.
// TODO: 🔐 Setup client<->server identity validation for both anonymous users and
//          authenticated ones.

//import Fastify from 'fastify';
import WebSocket, { WebSocketServer } from "ws";
import ip from "ip";
import chokidar from "chokidar";
import "dotenv/config";

// File Watching for Remote Development Mode (HTTP Server)
//const fastify = Fastify();

// Declare a route...
//fastify.post('/update', async (request, reply) => {
  // Send message to all connected users to reload a piece that's being coded.
//  everyone(pack("reload", request.body.piece));
//})

let port = 8080;
if (process.env.NODE_ENV === "development") port = 8082;

// Run the http server!
//const start = async () => {
//  try {
//    await fastify.listen({ port })
//    console.log("Fastify server online!", port);
//  } catch (err) {
//    console.log("Error!");
//    fastify.log.error(err)
//    process.exit(1)
//  }
//}
//await start();

//const server = fastify.server;

// Web Socket Server
let wss;
const connections = {};

let connectionId = 0; // TODO: Eventually replace with a username arrived at through
//                             a client <-> server authentication function.

if (process.env.NODE_ENV === "development") {
  /*
  // Put the development environment behind a local https server.
  const server = createServer({
    cert: readFileSync("../ssl-dev/localhost.pem"),
    key: readFileSync("../ssl-dev/localhost-key.pem"),
  });
  port = 8082;
  server.listen(port, () => {
    console.log(
      `🤖 server.aesthetic.computer (Development) socket: wss://${ip.address()}:${port}`
    );
  });
  */
  wss = new WebSocketServer({ port });
  //wss = new WebSocketServer({ port });
  console.log(
    `🤖 server.aesthetic.computer (Development) socket: ws://${ip.address()}:${port}`
  );
} else {
  // And assume that in production we are already behind an https proxy.
  wss = new WebSocketServer({ port });
  //wss = new WebSocketServer({ port });
  console.log(
    `🤖 server.aesthetic.computer (Production) socket: wss://${ip.address()}:${port}`
  );
}

// Pack messages into a simple object protocol of `{type, content}`.
function pack(type, content) {
  return JSON.stringify({ type, content });
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

  ws.send(pack("message", JSON.stringify(content)));

  // Send a message to all other clients except this one.
  function others(string) {
    wss.clients.forEach((c) => {
      if (c !== ws && c.readyState === WebSocket.OPEN) c.send(string);
    });
  }

  others(
    pack(
      "message",
      JSON.stringify({ text: `🤖 ${ip} : ${connectionId} has joined.` })
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

  /* Note: for some reason pinging was disconnecting users over and over again...
           TBD: Is pinging even necessary?

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
  wss.on("close", () => clearInterval(interval));
  */
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
      console.log("Disk:", event, path);
      if (event === "change") everyone(pack("reload", "disk"));
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
      console.log("System:", event, path);
      if (event === "change") everyone(pack("reload", "system"));
    });
}
