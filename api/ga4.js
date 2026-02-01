const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const dotenv = require("dotenv");

// Load local env if exists
dotenv.config({ path: "GA4.env" });
dotenv.config();

const propertyId = process.env.GA4_PROPERTY_ID;

// Google Auth: Prefer JSON string from env (for Cloud), fallback to file (for Local)
let clientConfig = {};
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    clientConfig.credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  } catch (e) {
    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON");
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  clientConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const client = new BetaAnalyticsDataClient(clientConfig);

function formatDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function toNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function buildChannelFilter(channel) {
  if (!channel || channel === "all") return undefined;
  const map = {
    organic: "Organic Search",
    paid: "Paid Search",
    social: "Organic Social",
    direct: "Direct",
    referral: "Referral",
  };
  const match = map[channel];
  if (!match) return undefined;
  return {
    filter: {
      fieldName: "sessionDefaultChannelGroup",
      stringFilter: { value: match, matchType: "EXACT" },
    },
  };
}

async function runReport(params) {
  const [response] = await client.runReport(params);
  return response;
}

module.exports = async (req, res) => {
  // Basic Auth is handled by Vercel's Edge config or we can implement it here
  // But for now, let's focus on getting the API working
  
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 365);
    const channel = req.query.channel || "all";
    const dateRange = {
      startDate: formatDate(days),
      endDate: "today",
    };
    const dimensionFilter = buildChannelFilter(channel);

    const totalsReport = await runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "userEngagementDuration" },
      ],
      ...(dimensionFilter ? { dimensionFilter } : {}),
    });

    const totalsRow = totalsReport.rows?.[0]?.metricValues || [];
    const totalUsers = toNumber(totalsRow[0]?.value);
    const newUsers = toNumber(totalsRow[1]?.value);
    const sessions = toNumber(totalsRow[2]?.value);
    const engagedSessions = toNumber(totalsRow[3]?.value);
    const totalEngagement = toNumber(totalsRow[4]?.value);
    const avgTime = totalUsers ? totalEngagement / totalUsers : 0;

    const dailyReport = await runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      ...(dimensionFilter ? { dimensionFilter } : {}),
    });

    const dailyDates = (dailyReport.rows || []).map(
      (row) => row.dimensionValues?.[0]?.value || ""
    );
    const dailyUsers = (dailyReport.rows || []).map((row) =>
      toNumber(row.metricValues?.[0]?.value)
    );

    const channelsReport = await runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 6,
      ...(dimensionFilter ? { dimensionFilter } : {}),
    });

    const channelsTotal = (channelsReport.rows || []).reduce(
      (sum, row) => sum + toNumber(row.metricValues?.[0]?.value),
      0
    );

    const channels = (channelsReport.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "Other",
      value: channelsTotal
        ? toNumber(row.metricValues?.[0]?.value) / channelsTotal
        : 0,
      users: toNumber(row.metricValues?.[0]?.value),
      newUsers: toNumber(row.metricValues?.[1]?.value),
      engagementRate: toNumber(row.metricValues?.[2]?.value),
    }));

    const channelsTrendReport = await runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      ...(dimensionFilter ? { dimensionFilter } : {}),
    });

    const trendDates = [];
    const trendMap = {};
    (channelsTrendReport.rows || []).forEach((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      const channelName = row.dimensionValues?.[1]?.value || "Other";
      const usersValue = toNumber(row.metricValues?.[0]?.value);
      if (!trendDates.includes(date)) trendDates.push(date);
      if (!trendMap[channelName]) trendMap[channelName] = {};
      trendMap[channelName][date] = usersValue;
    });

    const channelsTrend = {
      dates: trendDates,
      series: Object.keys(trendMap).map((channelName) => ({
        label: channelName,
        values: trendDates.map((d) => trendMap[channelName][d] || 0),
      })),
    };

    const sourcesReport = await runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "engagedSessions" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 5,
      ...(dimensionFilter ? { dimensionFilter } : {}),
    });

    const sources = (sourcesReport.rows || []).map((row) => {
      const source = row.dimensionValues?.[0]?.value || "";
      const medium = row.dimensionValues?.[1]?.value || "";
      return [
        `${source} / ${medium}`.trim(),
        toNumber(row.metricValues?.[0]?.value),
        toNumber(row.metricValues?.[1]?.value),
        toNumber(row.metricValues?.[2]?.value),
      ];
    });

    const pagesReport = await runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "activeUsers" },
        { name: "engagedSessions" },
        { name: "engagementRate" },
        { name: "userEngagementDuration" },
      ],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
      ...(dimensionFilter ? { dimensionFilter } : {}),
    });

    const pages = (pagesReport.rows || []).map((row) => {
      const activeUsers = toNumber(row.metricValues?.[0]?.value);
      const engaged = toNumber(row.metricValues?.[1]?.value);
      const engagementRate = toNumber(row.metricValues?.[2]?.value);
      const totalEngagement = toNumber(row.metricValues?.[3]?.value);
      const avgEngagement = activeUsers ? totalEngagement / activeUsers : 0;
      return [
        row.dimensionValues?.[0]?.value || "/",
        activeUsers,
        engaged,
        avgEngagement,
        engagementRate,
      ];
    });

    res.json({
      days,
      dailyDates,
      dailyUsers,
      totalUsers,
      sessions,
      newUsers,
      engagedSessions,
      avgTime,
      channels,
      channelsTrend,
      sources,
      pages,
    });
  } catch (error) {
    console.error("GA4 API error:", error);
    res.status(500).json({
      error: "GA4 API request failed",
      detail: error?.message || String(error),
    });
  }
};
