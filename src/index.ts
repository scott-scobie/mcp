import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createGithubMcpServerFromEnv } from "./server-factory.js";

serveStdio(() => createGithubMcpServerFromEnv());
