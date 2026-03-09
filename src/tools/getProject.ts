import { z } from "zod";
import { airbrakeGet, resolveUserKey } from "../lib/airbrake.js";

const inputSchema = z.object({
  userKey: z.string().optional().describe("Airbrake user API key (optional if AIRBRAKE_USER_KEY is set in MCP config env)"),
  projectId: z.number().describe("Numeric project ID (from list_projects)"),
});

export const getProject = {
  name: "airbrake_get_project",
  title: "Get Airbrake project",
  description: "Get details for a single Airbrake project by ID.",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const userKey = resolveUserKey(args.userKey);
    const data = await airbrakeGet<{ project: unknown }>(
      `/api/v4/projects/${args.projectId}`,
      { userKey }
    );
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  },
};

