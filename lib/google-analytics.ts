import { createSign } from "node:crypto";

export type AnalyticsRow = { name: string; value: number };
type GAResponse = {
  rows?: {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
  }[];
};
const endpoint = "https://analyticsdata.googleapis.com/v1beta";
function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}
async function accessToken() {
  const email = process.env.GA_CLIENT_EMAIL;
  const key = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key)
    throw new Error(
      "Google Analytics service account credentials are not configured.",
    );
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const message = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(message);
  signer.end();
  const assertion = `${message}.${signer.sign(key).toString("base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      `Google authentication failed (${response.status}). Check service account credentials.`,
    );
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}
async function report(
  property: string,
  token: string,
  days: number,
  dimensions: string[],
  metrics: string[],
  limit = 20,
): Promise<GAResponse> {
  const response = await fetch(`${endpoint}/properties/${property}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
      limit,
      orderBys: dimensions.includes("date")
        ? [{ dimension: { dimensionName: "date" } }]
        : [{ metric: { metricName: metrics[0] }, desc: true }],
    }),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      `Google Analytics reporting request failed (${response.status}). Verify the numeric property ID and service account Viewer access.`,
    );
  return response.json();
}
function rows(result: GAResponse): AnalyticsRow[] {
  return (result.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "Unknown",
    value: Number(row.metricValues?.[0]?.value || 0),
  }));
}
export async function getAnalytics(days: number) {
  const property = process.env.GA_PROPERTY_ID;
  if (!property || !/^\d+$/.test(property))
    throw new Error(
      "Set GA_PROPERTY_ID to the numeric GA4 Property ID (not the stream ID or Measurement ID).",
    );
  const token = await accessToken();
  const [summary, traffic, sources, pages, events] = await Promise.all([
    report(
      property,
      token,
      days,
      [],
      ["totalUsers", "screenPageViews", "sessions", "engagementRate"],
    ),
    report(property, token, days, ["date"], ["totalUsers"], 100),
    report(
      property,
      token,
      days,
      ["sessionDefaultChannelGroup"],
      ["sessions"],
      10,
    ),
    report(property, token, days, ["pagePath"], ["screenPageViews"], 10),
    report(property, token, days, ["eventName"], ["eventCount"], 30),
  ]);
  const values =
    summary.rows?.[0]?.metricValues?.map((x) => Number(x.value)) || [];
  return {
    users: values[0] || 0,
    views: values[1] || 0,
    sessions: values[2] || 0,
    engagement: values[3] || 0,
    traffic: rows(traffic),
    sources: rows(sources),
    pages: rows(pages),
    events: rows(events).filter(
      (x) =>
        ![
          "page_view",
          "session_start",
          "first_visit",
          "user_engagement",
          "scroll",
        ].includes(x.name),
    ),
  };
}
