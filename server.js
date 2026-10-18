const http = require("node:http");

const port = Number(process.env.PORT || 3000);
const hostname = "0.0.0.0";

async function main() {
  const next = (await import("next")).default;
  const app = next({ dev: false, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();
  http.createServer((request, response) => {
    handle(request, response);
  }).listen(port, hostname);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
