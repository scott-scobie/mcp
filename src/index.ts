import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

serveStdio(() => {
  const server = new McpServer({
    name: "personal-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_next_workout",
    {
      description: "Returns the user's next scheduled workout.",
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: "Your next workout is Lower #2 tomorrow at 7:00 AM.",
          },
        ],
      };
    }
  );

  return server;
});
