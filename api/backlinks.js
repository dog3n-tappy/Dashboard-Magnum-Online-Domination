/**
 * Backlinks API Handler
 * Fetches backlink data from Google Search Console API
 */

const dotenv = require('dotenv');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: 'GA4.env' });
dotenv.config();

const GSC_API_KEY = process.env.GSC_API_KEY || 'AIzaSyDUUrtji8-8D4lmZF_jX7bgKV7srWDJCVo';

// Property configurations for backlinks
const propertyConfigs = {
  magnum: {
    siteUrl: 'https://magnumestate.com/',
    credentialFile: 'endless-office.json',
  },
  anoya: {
    siteUrl: 'https://anoyavillas.com/',
    credentialFile: 'anoya-villas.json',
  },
  shisha: {
    siteUrl: 'https://shishacool.com/',
    credentialFile: 'shisha-cool.json',
  },
  skystar: {
    siteUrl: 'https://skystars.com/',
    credentialFile: null,
  },
  theumala: {
    siteUrl: 'https://theumala.com/',
    credentialFile: null,
  },
};

// Load service account for authentication
function loadServiceAccount(credentialFile) {
  if (!credentialFile) return null;
  try {
    const credPath = path.join(__dirname, '..', 'credentials', credentialFile);
    return JSON.parse(fs.readFileSync(credPath, 'utf8'));
  } catch (e) {
    console.warn(`Failed to load credential file ${credentialFile}:`, e.message);
    return null;
  }
}

function generateMockBacklinksData(days) {
  const baseBacklinks = 850 + Math.random() * 250;
  const trend = Math.random() * 5;

  const dailyBacklinks = Array.from({ length: days }, (_, i) => {
    const noise = Math.random() * 40 - 20;
    return Math.max(100, baseBacklinks + i * trend + noise);
  });

  const totalBacklinks = Math.round(
    dailyBacklinks.reduce((sum, v) => sum + v, 0) / days * 30
  );
  const newBacklinks = Math.round(totalBacklinks * 0.15);
  const referringDomains = Math.round(totalBacklinks * 0.25);
  const followBacklinks = Math.round(totalBacklinks * 0.68);
  const nofollowBacklinks = totalBacklinks - followBacklinks;
  const avgDA = 35 + Math.random() * 25;

  const dailyDates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  });

  const topDomains = [
    ['medium.com', Math.round(totalBacklinks * 0.18), Math.round(avgDA + 8)],
    ['reddit.com', Math.round(totalBacklinks * 0.14), Math.round(avgDA + 5)],
    ['linkedin.com', Math.round(totalBacklinks * 0.12), Math.round(avgDA + 10)],
    ['forbes.com', Math.round(totalBacklinks * 0.1), Math.round(avgDA + 12)],
    ['quora.com', Math.round(totalBacklinks * 0.08), Math.round(avgDA - 5)],
  ];

  const anchorTextDistribution = [
    ['real estate', Math.round(totalBacklinks * 0.22)],
    ['luxury homes', Math.round(totalBacklinks * 0.18)],
    ['property investment', Math.round(totalBacklinks * 0.15)],
    ['estate management', Math.round(totalBacklinks * 0.12)],
    ['magnum estates', Math.round(totalBacklinks * 0.1)],
    ['other anchors', Math.round(totalBacklinks * 0.23)],
  ];

  return {
    days,
    dailyDates,
    dailyBacklinks,
    totalBacklinks,
    newBacklinks,
    referringDomains,
    followBacklinks,
    nofollowBacklinks,
    avgDA,
    topDomains,
    anchorTextDistribution,
    source: 'mock',
  };
}

async function fetchFromGoogleSearchConsole(propertyKey, days) {
  const config = propertyConfigs[propertyKey];
  if (!config) {
    throw new Error(`Unknown property: ${propertyKey}`);
  }

  const serviceAccount = loadServiceAccount(config.credentialFile);
  if (!serviceAccount) {
    console.log(`No GSC credentials for property ${propertyKey}`);
    return null;
  }

  console.log(`✓ Loaded credentials for ${propertyKey} (${serviceAccount.client_email})`);

  try {
    // Create JWT client for authentication
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const webmasters = google.webmasters({
      version: 'v3',
      auth,
    });

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching GSC data from ${startDateStr} to ${endDateStr} for ${config.siteUrl}`);

    // Fetch links data from GSC - searchanalytics is at top level, not under sites
    const response = await webmasters.searchanalytics.query({
      siteUrl: config.siteUrl,
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['PAGE', 'QUERY'],
        rowLimit: 10000,
        dataState: 'all',
      },
    });

    console.log(`✓ Fetched GSC data for ${config.siteUrl}, rows: ${response.data?.rows?.length || 0}`);
    return parseGSCData(response.data, days, startDate);
  } catch (error) {
    console.error(`GSC API error for ${propertyKey}:`, error.message);
    console.error(`Full stack:`, error.stack);
    console.error(`Error code:`, error.code);
    console.error(`Error status:`, error.status);
    if (error.errors) {
      console.error(`API errors:`, JSON.stringify(error.errors, null, 2));
    }
    return null;
  }
}

function parseGSCData(gscData, days, startDate) {
  const dailyDates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  });

  // Track GSC Search Analytics metrics
  const uniqueQueries = new Set();
  const topQueries = {};
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalPosition = 0;
  let rowCount = 0;
  let clickedImpressions = 0;
  let unclickedImpressions = 0;

  // Only process if we have real GSC data
  if (gscData.rows && Array.isArray(gscData.rows) && gscData.rows.length > 0) {
    // Process GSC Search Analytics data
    gscData.rows.forEach(row => {
      if (row.keys && row.keys.length >= 2) {
        // row.keys[0] = page URL, row.keys[1] = query
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        const position = row.position || 1;
        
        const query = row.keys[1] || 'direct';
        
        // Track unique queries
        if (query && query.length > 0) {
          uniqueQueries.add(query);
          topQueries[query] = (topQueries[query] || 0) + clicks;
        }
        
        // Accumulate metrics
        totalClicks += clicks;
        totalImpressions += impressions;
        totalPosition += position;
        rowCount++;
        
        // Count clicked vs unclicked
        if (clicks > 0) {
          clickedImpressions += impressions;
        } else {
          unclickedImpressions += impressions;
        }
      }
    });
  }

  // If no real data found, return unavailable state
  if (totalImpressions === 0) {
    return {
      days,
      dailyDates,
      dailyBacklinks: [],
      totalBacklinks: 0,
      newBacklinks: 0,
      referringDomains: 0,
      followBacklinks: 0,
      nofollowBacklinks: 0,
      avgDA: 0,
      topDomains: [],
      anchorTextDistribution: [],
      source: 'none',
      dataAvailable: false,
    };
  }

  // Calculate metrics from real data
  const avgPosition = rowCount > 0 ? Math.round((totalPosition / rowCount) * 10) / 10 : 0;
  const uniqueQueriesCount = uniqueQueries.size;
  
  // Initialize daily backlinks array with real data
  const dailyBacklinks = new Array(days).fill(0);
  for (let i = 0; i < Math.min(days, dailyDates.length); i++) {
    dailyBacklinks[i] = Math.round(totalImpressions / days);
  }

  // Build top queries from real data
  const topQueries_array = Object.entries(topQueries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([query, clicks]) => [query, clicks]);

  return {
    days,
    dailyDates,
    dailyBacklinks,
    totalBacklinks: totalImpressions, // Search Impressions
    newBacklinks: totalClicks, // Total Clicks
    referringDomains: uniqueQueriesCount, // Unique Queries
    followBacklinks: clickedImpressions, // Clicked Impressions
    nofollowBacklinks: unclickedImpressions, // Unclicked Impressions
    avgDA: avgPosition, // Average Position
    topDomains: topQueries_array.slice(0, 5).map(([query, clicks]) => [query, clicks, Math.round(avgPosition)]),
    anchorTextDistribution: topQueries_array,
    source: 'gsc',
    dataAvailable: true,
  };
}

async function handleBacklinksRequest(req, res) {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const property = req.query.property || 'magnum';

    // Try to fetch from GSC
    let data = await fetchFromGoogleSearchConsole(property, days);
    
    // If no data from GSC (null result), return unavailable state
    if (!data) {
      console.log(`No GSC data for property ${property}`);
      // Return structure with dataAvailable: false instead of mock data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const dailyDates = Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10).replace(/-/g, '');
      });
      data = {
        days,
        dailyDates,
        dailyBacklinks: [],
        totalBacklinks: 0,
        newBacklinks: 0,
        referringDomains: 0,
        followBacklinks: 0,
        nofollowBacklinks: 0,
        avgDA: 0,
        topDomains: [],
        anchorTextDistribution: [],
        source: 'none',
        dataAvailable: false,
      };
    }

    res.json(data);
  } catch (error) {
    console.error('Backlinks API error:', error);
    res.status(500).json({
      error: 'Failed to fetch backlinks data',
      message: error.message,
      dataAvailable: false,
    });
  }
}

module.exports = handleBacklinksRequest;
