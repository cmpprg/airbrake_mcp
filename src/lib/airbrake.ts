const AIRBRAKE_API_BASE = "https://api.airbrake.io";

/** Env var read from MCP server config (e.g. env.AIRBRAKE_USER_KEY in ~/.cursor/mcp.json). */
export const AIRBRAKE_USER_KEY_ENV = "AIRBRAKE_USER_KEY";

export type AirbrakeKeys = {
  userKey: string;
};

/**
 * Resolve user key from tool args or from env (AIRBRAKE_USER_KEY).
 * Use when userKey is optional in the tool schema so the key can be set in MCP config.
 */
export function resolveUserKey(userKeyFromArgs?: string | null): string {
  const key = userKeyFromArgs?.trim() || process.env[AIRBRAKE_USER_KEY_ENV]?.trim();
  if (!key) {
    throw new Error(
      "Missing Airbrake user key. Set AIRBRAKE_USER_KEY in the MCP server env (e.g. in ~/.cursor/mcp.json) or pass userKey in the tool arguments."
    );
  }
  return key;
}

/**
 * GET request to Airbrake API v4 with user key auth.
 * Use for read-only endpoints (projects, groups, notices, etc.).
 */
export async function airbrakeGet<T>(
  path: string,
  { userKey }: AirbrakeKeys,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const search = new URLSearchParams({ key: userKey });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") {
      search.set(k, String(v));
    }
  }
  const url = `${AIRBRAKE_API_BASE}${path}?${search.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airbrake API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
