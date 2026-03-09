import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
  projectId: z.number().describe("Numeric project ID"),
  groupId: z.union([z.number(), z.string()]).describe("Error group ID. Pass as string to avoid precision loss for large IDs."),
  period: z.string().describe("Aggregation period, e.g. minute, hour"),
  timeGte: z.string().optional().describe("Filter results by time >= value (Unix timestamp)"),
  timeLt: z.string().optional().describe("Filter results by time < value (Unix timestamp)"),
  limit: z.number().optional().describe("Max number of results (default 100)"),
});

export const getGroupStats = {
  name: "airbrake_get_group_stats",
  title: "Get error group statistics",
  description: "Get statistics for an error group (accepted/limited counts over time). Requires period and time__gte.",
  inputSchema,
  handler: async (params: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(params.userKey);
    const { projectId, groupId, period, timeGte, timeLt, limit } = params;
    const query: Record<string, string | number> = { period };
    if (timeGte != null) query["time__gte"] = timeGte;
    if (timeLt != null) query["time__lt"] = timeLt;
    if (limit != null) query.limit = limit;
    const data = await airbrakeGet<{ projectId: number; groupId: number; accepted?: number[]; limited?: number[]; time?: string[] }>(
      `/api/v5/projects/${projectId}/groups/${String(groupId)}/stats`,
      { userKey },
      query
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};
