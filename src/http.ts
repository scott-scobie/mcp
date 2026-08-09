import { createServer } from "node:http";
import { createMcpHandler } from "@modelcontextprotocol/server";
import {
  localhostHostValidation,
  localhostOriginValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createGithubMcpServerFromEnv } from "./server-factory.js";

const port = Number(process.env.PORT ?? 3000);
const host = "127.0.0.1";

const handler = createMcpHandler(() => createGithubMcpServerFromEnv());
const nodeHandler = toNodeHandler(handler);
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();

const server = createServer((req, res) => {
  if (!validateHost(req, res) || !validateOrigin(req, res)) {
    return;
  }

  void nodeHandler(req, res);
});

server.listen(port, host, () => {
  console.log(`MCP HTTP server listening on http://${host}:${port}/mcp`);
});

async function shutdown() {
  await handler.close();
  server.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
