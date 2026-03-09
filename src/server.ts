import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listProjects } from "./tools/listProjects.js";
import { getProject } from "./tools/getProject.js";
import { listGroups } from "./tools/listGroups.js";
import { getGroup } from "./tools/getGroup.js";
import { listNotices } from "./tools/listNotices.js";
import { getNoticeStatus } from "./tools/getNoticeStatus.js";
import { getGroupStats } from "./tools/getGroupStats.js";

const server = new McpServer({
  name: "airbrake-mcp",
  version: "1.0.0",
});

const tools = [
  listProjects,
  getProject,
  listGroups,
  getGroup,
  listNotices,
  getNoticeStatus,
  getGroupStats,
];

for (const tool of tools) {
  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    tool.handler
  );
}

async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Airbrake MCP server running (stdio)");
}

startServer();
