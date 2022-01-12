import { createServer } from "https";
import { readFileSync } from "fs";
import WebSocket, { WebSocketServer } from "ws";
import ip from "ip";

import chokidar from "chokidar";

const server = createServer({
  cert: readFileSync("../ssl-dev/localhost.pem"),
  key: readFileSync("../ssl-dev/localhost-key.pem"),
});
const wss = new WebSocketServer({ server });

// Pack messages into a simple object protocol of `{type, content}`.
function pack(type, content) {
  return JSON.stringify({ type, content });
}

// Construct the server.
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress.slice(7) || "localhost"; // beautify ip

  // Send a single welcome message for every new client connection.
  const content = `${ip} → 🤹${wss.clients.size}`;
  console.log(content);
  ws.send(pack("message", content));

  // Send a message to all other clients except this one.
  function others(string) {
    wss.clients.forEach((c) => {
      if (c !== ws && c.readyState === WebSocket.OPEN) c.send(string);
    });
  }

  others(pack("message", `🤖 ${ip} has joined.`));

  // Relay all incoming messages from this client to everyone else.
  // TODO: 🔐 Validate the messages.
  ws.on("message", (data) => {
    others(data.toString());
  });

  /*
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

// Start the server.
server.listen(8082, () => {
  console.log(`🤖 aesthetic.computer Socket URL: wss://${ip.address()}:8082`);
});

// 🚧 Development Mode
// File watching uses: https://github.com/paulmillr/chokidar
// TODO: Use environment variables to disable this code in production?

// Sends a message to all connected clients.
function everyone(string) {
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(string);
  });
}

// 1. Watch for local file changes in disk or system directories.
chokidar.watch("../system/public/disks").on("all", (event, path) => {
  console.log("Disk:", event, path);
  if (event === "change") everyone(pack("reload", "disk"));
});

// TODO: Finish implementing this on the client.
chokidar
  .watch(["../system/public/computer", "../system/public/boot.js"])
  .on("all", (event, path) => {
    console.log("System:", event, path);
    if (event === "change") everyone(pack("reload", "system"));
  });
