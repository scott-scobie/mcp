import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createGithubMcpServer } from "./server-factory.js";

serveStdio(() => createGithubMcpServer());
