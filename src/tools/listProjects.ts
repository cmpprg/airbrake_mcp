import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
});

export const listProjects = {
  name: "airbrake_list_projects",
  title: "List Airbrake projects",
  description: "List all Airbrake projects accessible with the given user key. Use this to discover project IDs for other tools.",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(args.userKey);
    const data = await airbrakeGet<{ projects: unknown[]; count?: number }>(
      "/api/v4/projects",
      { userKey }
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};
