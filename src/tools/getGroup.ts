import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
  projectId: z.number().describe("Numeric project ID"),
  groupId: z.union([z.number(), z.string()]).describe("Error group ID (from list_groups or an error link). Pass as string to avoid precision loss for large IDs."),
});

export const getGroup = {
  name: "airbrake_get_group",
  title: "Get error group",
  description: "Get full details for a specific error group (type, message, backtrace, context, notice counts, etc.).",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(args.userKey);
    const data = await airbrakeGet<{ group: unknown }>(
      `/api/v4/projects/${args.projectId}/groups/${String(args.groupId)}`,
      { userKey }
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};
