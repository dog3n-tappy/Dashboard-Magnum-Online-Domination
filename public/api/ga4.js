const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load local env if exists
dotenv.config({ path: "GA4.env" });
dotenv.config();

console.log("=== GA4 Configuration Loading ===");
console.log("GA4_PROPERTIES_JSON exists:", !!process.env.GA4_PROPERTIES_JSON);

// Load property configuration
let properties = {};
if (process.env.GA4_PROPERTIES_JSON) {
  try {
    console.log("Raw GA4_PROPERTIES_JSON:", process.env.GA4_PROPERTIES_JSON);
    properties = JSON.parse(process.env.GA4_PROPERTIES_JSON);
    console.log("✓ Properties loaded:", Object.keys(properties));
    console.log("Properties values:", properties);
  } catch (e) {
    console.error("Failed to parse GA4_PROPERTIES_JSON:", e.message);
  }
}

// Default property for backward compatibility
const defaultPropertyId = process.env.GA4_PROPERTY_ID || Object.values(properties)[0];

// Load service account mappings
let serviceAccountMap = {};
if (process.env.GA4_SERVICE_ACCOUNTS_JSON) {
  try {
    serviceAccountMap = JSON.parse(process.env.GA4_SERVICE_ACCOUNTS_JSON);
  } catch (e) {
    console.error("Failed to parse GA4_SERVICE_ACCOUNTS_JSON");
  }
}

// Load service account credentials from JSON files
let endlessCredentials = {};
let anyoaCredentials = {};
let shishacoolCredentials = {};

try {
  const endlessPath = path.join(__dirname, "..", "credentials", "endless-office.json");
  if (fs.existsSync(endlessPath)) {
    const data = fs.readFileSync(endlessPath, "utf8");
    endlessCredentials = JSON.parse(data);
    console.log("✓ Endless Office (Magnum Estate) credentials loaded");
  }
} catch (e) {
  console.error("Failed to load endless-office.json:", e.message);
}

try {
  const anoyaPath = path.join(__dirname, "..", "credentials", "anoya-villas.json");
  if (fs.existsSync(anoyaPath)) {
    const data = fs.readFileSync(anoyaPath, "utf8");
    anyoaCredentials = JSON.parse(data);
    console.log("✓ Anoya Villas credentials loaded");
  }
} catch (e) {
  console.error("Failed to load anoya-villas.json:", e.message);
}

try {
  const shishaPath = path.join(__dirname, "..", "credentials", "shisha-cool.json");
  if (fs.existsSync(shishaPath)) {
    const data = fs.readFileSync(shishaPath, "utf8");
    shishacoolCredentials = JSON.parse(data);
    console.log("✓ Shisha Cool credentials loaded");
  }
} catch (e) {
  console.error("Failed to load shisha-cool.json:", e.message);
}

// Create client instances for each service account
const clients = {};

// Endless Office client (Magnum Estate)
if (endlessCredentials && endlessCredentials.private_key) {
  clients.endless = new BetaAnalyticsDataClient({ credentials: endlessCredentials });
  console.log("✓ Endless Office (Magnum Estate) GA4 client loaded");
}

// Anoya client (if credentials available)
if (anyoaCredentials && anyoaCredentials.private_key) {
  clients.anoya = new BetaAnalyticsDataClient({ credentials: anyoaCredentials });
  console.log("✓ Anoya Villas GA4 client loaded");
}

// Shisha Cool client (if credentials available)
if (shishacoolCredentials && shishacoolCredentials.private_key) {
  clients.shishacool = new BetaAnalyticsDataClient({ credentials: shishacoolCredentials });
  console.log("✓ Shisha Cool GA4 client loaded");
}

// Get the appropriate client for a property
function getClientForProperty(propertyKey) {
  const accountKey = serviceAccountMap[propertyKey];
  if (!accountKey) {
    return null; // No service account configured
  }
  const client = clients[accountKey];
  if (!client) {
    console.warn(`No GA4 client available for property key: ${propertyKey}`);
    return null;
  }
  return client;
}

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

async function runReport(client, params) {
  const [response] = await client.runReport(params);
  return response;
}

async function fetchPropertyData(propertyId, propertyKey, days, channel, startDate, endDate) {
  const client = getClientForProperty(propertyKey);
  
  if (!client) {
    throw new Error(`No GA4 credentials available for property: ${propertyKey}`);
  }
  
  const dateRange = getDateRange(days, startDate, endDate);
  const dimensionFilter = buildChannelFilter(channel);

  const totalsReport = await runReport(client, {
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

  const dailyReport = await runReport(client, {
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

  const channelsReport = await runReport(client, {
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

  const sourcesReport = await runReport(client, {
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

  const pagesReport = await runReport(client, {
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

  const channelsTrendReport = await runReport(client, {
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

async function aggregatePropertyData(propertyIds, propertyKeys, days, channel, startDate, endDate) {
  const allData = await Promise.allSettled(
    propertyIds.map((id, idx) => fetchPropertyData(id, propertyKeys[idx], days, channel, startDate, endDate))
  );

  // Filter out failed properties
  const successfulData = allData
    .map((result, idx) => ({ 
      data: result.status === 'fulfilled' ? result.value : null,
      key: propertyKeys[idx],
      status: result.status
    }))
    .filter(item => item.status === 'fulfilled')
    .map(item => item.data);

  // Aggregate metrics
  const totalUsers = successfulData.reduce((sum, d) => sum + d.totalUsers, 0);
  const newUsers = successfulData.reduce((sum, d) => sum + d.newUsers, 0);
  const sessions = successfulData.reduce((sum, d) => sum + d.sessions, 0);
  const engagedSessions = successfulData.reduce((sum, d) => sum + d.engagedSessions, 0);
  const totalEngagement = successfulData.reduce(
    (sum, d) => sum + d.avgTime * d.sessions,
    0
  );
  const avgTime = sessions ? totalEngagement / sessions : 0;

  // Aggregate daily data
  const dailyMap = {};
  successfulData.forEach((data) => {
    data.dailyDates.forEach((date, idx) => {
      if (!dailyMap[date]) dailyMap[date] = 0;
      dailyMap[date] += data.dailyUsers[idx];
    });
  });
  const dailyDates = Object.keys(dailyMap).sort();
  const dailyUsers = dailyDates.map((date) => dailyMap[date]);

  // Aggregate channels
  const channelMap = {};
  successfulData.forEach((data) => {
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
    const totalForChannel = successfulData.reduce((sum, d) => {
      const found = d.channels.find((c) => c.name === ch.name);
      return sum + (found ? found.engagementRate * found.users : 0);
    }, 0);
    ch.engagementRate = ch.users ? totalForChannel / ch.users : 0;
  });
  const channels = Object.values(channelMap);

  // Aggregate sources
  const sourceMap = {};
  successfulData.forEach((data) => {
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
  successfulData.forEach((data) => {
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
  successfulData.forEach((data) => {
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
    let selectedProperty = req.query.property || "magnum";
    
    let data;
    
    // Check if overview mode
    if (selectedProperty === "overview") {
      // Get all property IDs and keys
      const propertyKeys = Object.keys(properties);
      const propertyIds = propertyKeys.map(key => properties[key]);
      data = await aggregatePropertyData(propertyIds, propertyKeys, days, channel, startDate, endDate);
    } else {
      // Single property mode
      const propertyId = properties[selectedProperty] || defaultPropertyId;
      
      if (!propertyId) {
        return res.status(400).json({ error: "Invalid property selected" });
      }
      
      // Check if this property has credentials available
      const hasCredentials = serviceAccountMap[selectedProperty] !== null && serviceAccountMap[selectedProperty] !== undefined;
      if (!hasCredentials) {
        return res.status(503).json({ 
          error: "API not available",
          apiNotAvailable: true,
          property: selectedProperty,
          message: "Service account credentials not configured for this property" 
        });
      }
      
      data = await fetchPropertyData(propertyId, selectedProperty, days, channel, startDate, endDate);
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
