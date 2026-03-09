import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
  projectId: z.number().describe("Numeric project ID"),
  noticeUuid: z.string().describe("Notice UUID (returned when creating a notice via the notifier API)"),
});

export const getNoticeStatus = {
  name: "airbrake_get_notice_status",
  title: "Get notice status",
  description: "Get the status of a notice by UUID: processed, rejected, archived, or not_found. If processed, returns the groupId.",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(args.userKey);
    const data = await airbrakeGet<{ code: string; groupId?: string; message?: string }>(
      `/api/v4/projects/${args.projectId}/notice-status/${args.noticeUuid}`,
      { userKey }
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};
