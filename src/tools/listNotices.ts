import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
  projectId: z.number().describe("Numeric project ID"),
  groupId: z.union([z.number(), z.string()]).describe("Error group ID. Pass as string to avoid precision loss for large IDs."),
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().optional().describe("Items per page (default 20)"),
  version: z.string().optional().describe("Filter notices by app version, e.g. 1.0"),
});

export const listNotices = {
  name: "airbrake_list_notices",
  title: "List notices (occurrences)",
  description: "List notices (occurrences) for an error group. Each notice is one instance of the error with full context, backtrace, and params.",
  inputSchema,
  handler: async (params: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(params.userKey);
    const { projectId, groupId, page, limit, version } = params;
    const query: Record<string, string | number> = {};
    if (page != null) query.page = page;
    if (limit != null) query.limit = limit;
    if (version != null) query.version = version;
    const data = await airbrakeGet<{ notices: unknown[]; count?: number; page?: number }>(
      `/api/v4/projects/${projectId}/groups/${String(groupId)}/notices`,
      { userKey },
      query
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};
