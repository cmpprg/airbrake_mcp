import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
  projectId: z.number().describe("Numeric project ID"),
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().optional().describe("Items per page (default 20)"),
  order: z.enum(["last_notice", "notice_count", "weight", "created"]).optional().describe("Sort order"),
  archived: z.boolean().optional().describe("When true, return archived groups"),
  muted: z.boolean().optional().describe("When true, return muted groups"),
  startTime: z.string().optional().describe("Return groups created after this time (ISO8601)"),
  endTime: z.string().optional().describe("Return groups created before this time (ISO8601)"),
});

export const listGroups = {
  name: "airbrake_list_groups",
  title: "List error groups",
  description: "List error groups (errors) in an Airbrake project. Supports pagination and filters (archived, muted, time range, order).",
  inputSchema,
  handler: async (params: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(params.userKey);
    const { projectId, page, limit, order, archived, muted, startTime, endTime } = params;
    const query: Record<string, string | number> = {};
    if (page != null) query.page = page;
    if (limit != null) query.limit = limit;
    if (order != null) query.order = order;
    if (archived != null) query.archived = String(archived);
    if (muted != null) query.muted = String(muted);
    if (startTime != null) query.start_time = startTime;
    if (endTime != null) query.end_time = endTime;
    const data = await airbrakeGet<{ groups: unknown[]; count?: number; page?: number }>(
      `/api/v4/projects/${projectId}/groups`,
      { userKey },
      query
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};
