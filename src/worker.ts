import { createMcpHandler } from "@modelcontextprotocol/server";
import { createGithubMcpServer } from "./server-factory.js";

export interface Env {
  GITHUB_TOKEN: string;
  MCP_ACCESS_TOKEN: string;
}

function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}

function missingSecrets(): Response {
  return new Response(
    "Server is missing required secrets. Run: npx wrangler secret put GITHUB_TOKEN && npx wrangler secret put MCP_ACCESS_TOKEN",
    { status: 500 }
  );
}

function isAuthorized(request: Request, accessToken: string): boolean {
  const header = request.headers.get("Authorization");
  return header === `Bearer ${accessToken}`;
}

async function handleMcpRequest(
  request: Request,
  githubToken: string
): Promise<Response> {
  const handler = createMcpHandler(() => createGithubMcpServer(githubToken), {
    responseMode: "json",
  });

  try {
    return await handler.fetch(request);
  } finally {
    await handler.close();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const path =
      url.pathname.length > 1
        ? url.pathname.replace(/\/+$/, "")
        : url.pathname;

    if (path === "/health") {
      return new Response("ok", { status: 200 });
    }

    if (!env.GITHUB_TOKEN || !env.MCP_ACCESS_TOKEN) {
      return missingSecrets();
    }

    // MCP clients send CORS preflight before POST; auth runs after that.
    if (request.method === "OPTIONS") {
      return handleMcpRequest(request, env.GITHUB_TOKEN);
    }

    if (!isAuthorized(request, env.MCP_ACCESS_TOKEN)) {
      return unauthorized();
    }

    return handleMcpRequest(request, env.GITHUB_TOKEN);
  },
};
