import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  listMyRepos,
  listOpenIssues,
  listOpenPullRequests,
} from "./github.js";

export function createGithubMcpServer(): McpServer {
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
      const text = await listMyRepos(limit ?? 10);
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
      const text = await listOpenIssues(owner, repo, limit ?? 20);
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
      const text = await listOpenPullRequests(owner, repo, limit ?? 20);
      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  return server;
}
