export class Socket {
  #killSocket = false;
  #ws;
  #reconnectTime = 1000;

  constructor(host, receive, reload, protocol = "wss") {
    this.#connect(host, receive, reload, protocol);
  }

  // Connects a WebSocket object and takes a handler for messages.
  #connect(host, receive, reload, protocol = "wss") {
    this.#ws = new WebSocket(`${protocol}://${host}`);
    const ws = this.#ws;

    // Send a message to the console after the first connection.
    ws.onopen = (e) => {
      console.log("📡 Connected");
      this.#reconnectTime = 1000;
    };

    // Respond to incoming messages and assume `e.data` is a JSON String.
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      this.#preReceive(msg, receive, reload);
    };

    // Recursively re-connect after every second upon close or failed connection.
    ws.onclose = (e) => {
      console.warn("📡 Disconnected...", e.reason);
      // Only reconnect if we are not killing the socket and not in development mode.
      if (this.#killSocket === false && reload === undefined) {
        console.log("📡 Reconnecting in:", this.#reconnectTime, "ms");
        setTimeout(() => {
          this.#connect(host, receive, reload);
        }, this.#reconnectTime);
        this.#reconnectTime = Math.min(this.#reconnectTime * 2, 32000);
      }
    };

    // Close on error.
    ws.onerror = (err) => {
      console.error("📡 Error:", err);
      ws.close();
    };
  }

  // Send a formatted message to the connected WebSocket server.
  // Passes silently on no connection.
  send(type, content) {
    if (this.#ws.readyState === WebSocket.OPEN)
      this.#ws.send(JSON.stringify({ type, content }));
  }

  // Kills the socket permanently.
  kill() {
    this.#killSocket = true;
    this.#ws.close();
  }

  // Before passing messages to disk code, handle some system messages here.
  // Note: "reload" should only be defined when developing.
  #preReceive({ id, type, content }, receive, reload) {
    if (type === "message") {
      console.log(`📡 ${content}`);
    } else if (type === "reload" && reload) {
      if (content === "disk") {
        console.log("💾️ Reloading disk...");
        this.kill();
        reload(); // TODO: Should reload be passed all the way in here?
      } else if (content === "system" && reload) {
        console.log("💥️ Restarting system...");
        reload("refresh"); // Reload the whole page.
      }
    } else {
      receive?.(id, type, content);
    }
  }
}
