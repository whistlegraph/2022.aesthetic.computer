import { createServer } from "http";
const PORT = process.env.PORT;

const server = createServer((req, res) => {
  res.end("Hello aesthetic.computer!");
});

server.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
