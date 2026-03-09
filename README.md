# Airbrake MCP Server

MCP (Model Context Protocol) server for **read-only** Airbrake error tracking. Lets an AI list projects, list and inspect error groups, and fetch notices (occurrences) and group statistics.

## Requirements

- **User API key** from Airbrake (not the project key). Find it under your Airbrake account → [API Keys](https://airbrake.io/docs/api-keys/).
- Node.js 18+

## Setup

```bash
npm install
npm run build
```

## Running

Stdio transport (for Claude Desktop, Cursor, or other MCP clients that spawn the server):

```bash
npm start
# or: node dist/server.js
```

Configure your MCP client with the server command. You can set the user key in either place:

- **MCP config env (recommended)** — Set `AIRBRAKE_USER_KEY` in the server’s `env` so you don’t pass it every time. Example in Cursor’s `~/.cursor/mcp.json`:

  ```json
  {
    "mcpServers": {
      "airbrake": {
        "command": "node",
        "args": ["/path/to/airbrake_mcp/dist/server.js"],
        "env": {
          "AIRBRAKE_USER_KEY": "your-user-api-key-here"
        }
      }
    }
  }
  ```

- **Tool arguments** — Pass `userKey` (and when needed `projectId`, `groupId`) in each tool call. If `AIRBRAKE_USER_KEY` is set in env, `userKey` is optional in tool arguments.

## Tools (error tracking only)

| Tool | Description |
|------|-------------|
| `airbrake_list_projects` | List all projects (use this to get `projectId` for other tools). |
| `airbrake_get_project` | Get one project by ID. |
| `airbrake_list_groups` | List error groups in a project (with optional pagination, order, archived/muted, time range). |
| `airbrake_get_group` | Get one error group (type, message, backtrace, context, notice counts). |
| `airbrake_list_notices` | List notices (occurrences) for an error group. |
| `airbrake_get_notice_status` | Get status of a notice by UUID (e.g. after creating a notice via the notifier API). |
| `airbrake_get_group_stats` | Get statistics for an error group (accepted/limited over time). |

All tools take optional `userKey`; if omitted, the server uses `AIRBRAKE_USER_KEY` from the MCP config env. Project- and group-scoped tools also take `projectId` and/or `groupId` as required.

## Using from another project (Cursor, Claude Desktop, etc.)

The server runs as a **stdio** subprocess. Point your MCP client at the **built** server on your machine.

### 1. Build the server once (in this repo)

```bash
cd /Users/ryancamp/airbrake_mcp
npm install
npm run build
```

### 2. Configure your MCP client

Use the **absolute path** to `dist/server.js` so it works from any project.

**Cursor** — edit `~/.cursor/mcp.json` and add (or merge) under `mcpServers`. Put your Airbrake user API key in `env.AIRBRAKE_USER_KEY`:

```json
{
  "mcpServers": {
    "airbrake": {
      "command": "node",
      "args": ["/Users/ryancamp/airbrake_mcp/dist/server.js"],
      "env": {
        "AIRBRAKE_USER_KEY": "your-user-api-key-here"
      }
    }
  }
}
```

**Claude Desktop** — edit the config file (e.g. `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS) and add the same `airbrake` entry under `mcpServers`.

**Other MCP clients** — run the server with:

```bash
node /Users/ryancamp/airbrake_mcp/dist/server.js
```

Restart Cursor (or your client) after changing the config so it picks up the Airbrake server.

### 3. Use it from any project

Open any other project in Cursor; the Airbrake tools will be available. When you ask about Airbrake (e.g. “list my Airbrake errors” or “show me group 12345”), the AI will call the tools. If you set `AIRBRAKE_USER_KEY` in the MCP config (see above), you don't need to provide the key in the conversation. Otherwise, give your user key in the chat (e.g. “use user key …”) so the AI can pass it as `userKey`. Optionally give a default `projectId` (e.g. 12345) so the AI can use it for list_groups / get_group.

## API reference

Based on [Airbrake API (Error tracking)](https://docs.airbrake.io/docs/devops-tools/api/). This server uses only read endpoints; no deploy or write APIs are used.
