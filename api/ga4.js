const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const dotenv = require("dotenv");

// Load local env if exists
dotenv.config({ path: "GA4.env" });
dotenv.config();

// Load property configuration
let properties = {};
if (process.env.GA4_PROPERTIES_JSON) {
  try {
    properties = JSON.parse(process.env.GA4_PROPERTIES_JSON);
  } catch (e) {
    console.error("Failed to parse GA4_PROPERTIES_JSON");
  }
}

// Default property for backward compatibility
const defaultPropertyId = process.env.GA4_PROPERTY_ID || Object.values(properties)[0];

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

function getDateRange(days, startDate, endDate) {
  if (startDate && endDate) {
    // Use explicit dates
    return { startDate, endDate };
  }
  
  // Calculate from days
  const d = new Date();
  d.setDate(d.getDate() - (days || 30));
  const calculatedStart = d.toISOString().slice(0, 10);
  const calculatedEnd = new Date().toISOString().slice(0, 10);
  
  return { startDate: calculatedStart, endDate: calculatedEnd };
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

async function fetchPropertyData(propertyId, days, channel, startDate, endDate) {
  const dateRange = getDateRange(days, startDate, endDate);
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
  const avgTime = sessions ? totalEngagement / sessions : 0;

  const dailyReport = await runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    metrics: [{ name: "activeUsers" }],
    dimensions: [{ name: "date" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  const dailyDates = (dailyReport.rows || []).map(
    (row) => row.dimensionValues?.[0]?.value
  );
  const dailyUsers = (dailyReport.rows || []).map((row) =>
    toNumber(row.metricValues?.[0]?.value)
  );

  const channelsReport = await runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    metrics: [
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "engagementRate" },
    ],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  const channels = (channelsReport.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "Direct",
    users: toNumber(row.metricValues?.[0]?.value),
    newUsers: toNumber(row.metricValues?.[1]?.value),
    engagementRate: toNumber(row.metricValues?.[2]?.value),
  }));

  const sourcesReport = await runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    metrics: [
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "engagementRate" },
    ],
    dimensions: [{ name: "firstUserSource" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, descending: true }],
    limit: 10,
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  const sources = (sourcesReport.rows || []).map((row) => [
    row.dimensionValues?.[0]?.value || "Direct",
    toNumber(row.metricValues?.[0]?.value),
    toNumber(row.metricValues?.[1]?.value),
    toNumber(row.metricValues?.[2]?.value),
  ]);

  const pagesReport = await runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    metrics: [
      { name: "activeUsers" },
      { name: "engagedSessions" },
      { name: "engagementRate" },
      { name: "userEngagementDuration" },
    ],
    dimensions: [{ name: "pageTitle" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, descending: true }],
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

  const channelsTrendReport = await runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    metrics: [{ name: "activeUsers" }],
    dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  const channelsTrendMap = {};
  (channelsTrendReport.rows || []).forEach((row) => {
    const date = row.dimensionValues?.[0]?.value;
    const channel = row.dimensionValues?.[1]?.value || "Direct";
    const users = toNumber(row.metricValues?.[0]?.value);
    if (!channelsTrendMap[date]) channelsTrendMap[date] = {};
    channelsTrendMap[date][channel] = users;
  });

  const channelsTrend = Object.entries(channelsTrendMap).map(([date, data]) => [
    date,
    ...Object.values(data),
  ]);

  return {
    totalUsers,
    newUsers,
    sessions,
    engagedSessions,
    avgTime,
    dailyDates,
    dailyUsers,
    channels,
    sources,
    pages,
    channelsTrend,
  };
}

async function aggregatePropertyData(propertyIds, days, channel, startDate, endDate) {
  const allData = await Promise.all(
    propertyIds.map((id) => fetchPropertyData(id, days, channel, startDate, endDate))
  );

  // Aggregate metrics
  const totalUsers = allData.reduce((sum, d) => sum + d.totalUsers, 0);
  const newUsers = allData.reduce((sum, d) => sum + d.newUsers, 0);
  const sessions = allData.reduce((sum, d) => sum + d.sessions, 0);
  const engagedSessions = allData.reduce((sum, d) => sum + d.engagedSessions, 0);
  const totalEngagement = allData.reduce(
    (sum, d) => sum + d.avgTime * d.sessions,
    0
  );
  const avgTime = sessions ? totalEngagement / sessions : 0;

  // Aggregate daily data
  const dailyMap = {};
  allData.forEach((data) => {
    data.dailyDates.forEach((date, idx) => {
      if (!dailyMap[date]) dailyMap[date] = 0;
      dailyMap[date] += data.dailyUsers[idx];
    });
  });
  const dailyDates = Object.keys(dailyMap).sort();
  const dailyUsers = dailyDates.map((date) => dailyMap[date]);

  // Aggregate channels
  const channelMap = {};
  allData.forEach((data) => {
    data.channels.forEach((ch) => {
      if (!channelMap[ch.name]) {
        channelMap[ch.name] = {
          name: ch.name,
          users: 0,
          newUsers: 0,
          engagementRate: 0,
        };
      }
      channelMap[ch.name].users += ch.users;
      channelMap[ch.name].newUsers += ch.newUsers;
    });
  });
  // Calculate weighted average engagement rate
  Object.values(channelMap).forEach((ch) => {
    const totalForChannel = allData.reduce((sum, d) => {
      const found = d.channels.find((c) => c.name === ch.name);
      return sum + (found ? found.engagementRate * found.users : 0);
    }, 0);
    ch.engagementRate = ch.users ? totalForChannel / ch.users : 0;
  });
  const channels = Object.values(channelMap);

  // Aggregate sources
  const sourceMap = {};
  allData.forEach((data) => {
    data.sources.forEach((source) => {
      const name = source[0];
      if (!sourceMap[name]) sourceMap[name] = [name, 0, 0, 0];
      sourceMap[name][1] += source[1];
      sourceMap[name][2] += source[2];
    });
  });
  const sources = Object.values(sourceMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Aggregate pages
  const pageMap = {};
  allData.forEach((data) => {
    data.pages.forEach((page) => {
      const title = page[0];
      if (!pageMap[title]) pageMap[title] = [title, 0, 0, 0, 0];
      pageMap[title][1] += page[1];
      pageMap[title][2] += page[2];
    });
  });
  const pages = Object.values(pageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Aggregate channel trends
  const trendMap = {};
  allData.forEach((data) => {
    data.channelsTrend.forEach((row) => {
      const date = row[0];
      if (!trendMap[date]) trendMap[date] = [date, 0, 0, 0, 0, 0, 0];
      for (let i = 1; i < row.length; i++) {
        trendMap[date][i] = (trendMap[date][i] || 0) + (row[i] || 0);
      }
    });
  });
  const channelsTrend = Object.values(trendMap).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return {
    totalUsers,
    newUsers,
    sessions,
    engagedSessions,
    avgTime,
    dailyDates,
    dailyUsers,
    channels,
    sources,
    pages,
    channelsTrend,
  };
}

module.exports = async (req, res) => {
  try {
    const days = req.query.days ? Math.min(Math.max(Number(req.query.days), 7), 365) : null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const channel = req.query.channel || "all";
    
    // Get property from query or use default
    let selectedProperty = req.query.property || "magnumestate";
    
    let data;
    
    // Check if overview mode
    if (selectedProperty === "overview") {
      // Get all property IDs
      const propertyIds = Object.values(properties);
      data = await aggregatePropertyData(propertyIds, days, channel, startDate, endDate);
    } else {
      // Single property mode
      const propertyId = properties[selectedProperty] || defaultPropertyId;
      
      if (!propertyId) {
        return res.status(400).json({ error: "Invalid property selected" });
      }
      
      data = await fetchPropertyData(propertyId, days, channel, startDate, endDate);
    }
    
    res.json({
      days,
      ...data,
    });
  } catch (error) {
    console.error("GA4 API error:", error);
    res.status(500).json({
      error: "GA4 API request failed",
      detail: error?.message || String(error),
    });
  }
};
