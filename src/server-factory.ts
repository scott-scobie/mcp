import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { createGithubClient } from "./github.js";

export function createGithubMcpServer(githubToken: string): McpServer {
  const github = createGithubClient(githubToken);

  const server = new McpServer({
    name: "mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "list_my_repos",
    {
      description:
        "Lists the authenticated user's GitHub repositories, sorted by most recently updated.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe("Maximum number of repos to return (default 10)"),
      }),
    },
    async ({ limit }) => {
      const text = await github.listMyRepos(limit ?? 10);
      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  server.registerTool(
    "list_open_issues",
    {
      description: "Lists open issues for a GitHub repository.",
      inputSchema: z.object({
        owner: z.string().describe("Repository owner (user or org)"),
        repo: z.string().describe("Repository name"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe("Maximum number of issues to return (default 20)"),
      }),
    },
    async ({ owner, repo, limit }) => {
      const text = await github.listOpenIssues(owner, repo, limit ?? 20);
      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  server.registerTool(
    "list_open_pull_requests",
    {
      description: "Lists open pull requests for a GitHub repository.",
      inputSchema: z.object({
        owner: z.string().describe("Repository owner (user or org)"),
        repo: z.string().describe("Repository name"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe("Maximum number of pull requests to return (default 20)"),
      }),
    },
    async ({ owner, repo, limit }) => {
      const text = await github.listOpenPullRequests(owner, repo, limit ?? 20);
      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  return server;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Add it to your .env file.`);
  }
  return value;
}

export function createGithubMcpServerFromEnv(): McpServer {
  return createGithubMcpServer(requireEnv("GITHUB_TOKEN"));
}
