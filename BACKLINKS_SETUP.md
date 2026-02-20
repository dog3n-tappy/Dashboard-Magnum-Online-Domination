# Backlinks Tracker Integration Guide

## Overview

The Backlinks Tracker is now integrated into your CEO Dashboard with the following KPIs:

- **Total Backlinks**: All backlinks pointing to your site
- **New Backlinks**: Backlinks acquired in the selected period
- **Referring Domains**: Count of unique domains linking to you
- **Follow Backlinks**: Links that pass authority to your site
- **Nofollow Backlinks**: Links that don't pass authority
- **Average Domain Authority (DA)**: Quality metric of linking sites
- **Follow vs Nofollow Ratio**: Visual breakdown of link types

## Current Status

✅ **Frontend Implementation**: Complete
- New "Backlinks" tab with 6 KPI cards
- Growth chart showing backlinks trend over time
- Follow vs Nofollow doughnut chart
- Top referring domains table
- Anchor text distribution table
- Time filtering respects existing rangeSelect (1 day, 30 days, 90 days, 365 days)
- Full i18n support (Russian & English)

⏳ **Backend Integration**: Ready for configuration

Currently, the dashboard uses **mock data for Backlinks**. To connect real backlinks data, you have these options:

---

## Option 1: Google Search Console API (Recommended for GSC Users)

*Note: GSC API has limited backlink data compared to third-party tools. Use this if you're already using GSC.*

### Setup Steps

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google Search Console API"
4. Create a Service Account:
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name: `backlinks-dashboard`
   - Click **Create and Continue**
   - Grant role: `Editor` (or custom role with GSC access)
   - Click **Continue** → **Done**

#### Step 2: Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Save the file (you'll need it shortly)

#### Step 3: Grant GSC Access

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to **Settings** → **Users and permissions**
4. Click **Add user**
5. Add the service account email (found in the JSON key file as `client_email`)
6. Grant at least **Editor** permissions

#### Step 4: Configure Environment Variables

Create a `GSC.env` file in your project root:

```env
# Paste the entire JSON service account credentials (minified on one line)
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"service-account@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token"}

# Your website URL (with protocol, no trailing slash)
GSC_SITE_URL=https://yourdomain.com
```

**⚠️ Important**: To format the JSON on one line:
1. Take the downloaded service account JSON
2. Remove all newlines (replace `\n` with actual line breaks)
3. Paste as a single line

Or use this command in PowerShell:
```powershell
$json = Get-Content 'C:\path\to\service-account.json' -Raw
$encoded = $json -replace '\s*[\r\n]+\s*', ''
Write-Output $encoded | Set-Clipboard
```

---

## Option 2: Ahrefs API (Most Data-Rich)

*Ahrefs provides the most comprehensive backlink data.*

### Setup Steps

1. **Get Ahrefs API Key**:
   - Sign up for [Ahrefs](https://ahrefs.com)
   - Go to Settings → API
   - Copy your API key

2. **Create `GSC.env`**:
```env
AHREFS_API_KEY=your_ahrefs_api_key
AHREFS_SITE_URL=yourdomain.com
```

3. **Update `/api/backlinks.js`**:

Add this package:
```bash
npm install ahrefs
```

Update the API handler:

```javascript
const Ahrefs = require('ahrefs');

const ahrefs = new Ahrefs({
  apiKey: process.env.AHREFS_API_KEY
});

async function fetchFromAhrefs(days) {
  const siteUrl = process.env.AHREFS_SITE_URL || 'example.com';
  
  const backlinksData = await ahrefs.getBacklinks(siteUrl, {
    limit: 1000,
    order_by: 'date_desc',
    where: [
      {
        target: 'backlinks.date_created',
        operator: '>=',
        value: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });

  return {
    totalBacklinks: backlinksData.total,
    newBacklinks: backlinksData.data.length,
    referringDomains: new Set(backlinksData.data.map(b => b.source_domain)).size,
    followBacklinks: backlinksData.data.filter(b => !b.nofollow).length,
    nofollowBacklinks: backlinksData.data.filter(b => b.nofollow).length,
    // ... more transformations
  };
}
```

---

## Option 3: Semrush API

1. Get API key from [Semrush](https://semrush.com)
2. Install: `npm install semrush`
3. Update `/api/backlinks.js` with Semrush client

```javascript
const SemrushClient = require('semrush');

const semrush = new SemrushClient({
  apiKey: process.env.SEMRUSH_API_KEY
});

async function fetchFromSemrush(days) {
  const data = await semrush.getBacklinks({
    domain: process.env.SEMRUSH_DOMAIN,
    limit: 1000
  });
  
  // Transform data to match dashboard format
  return transformSemrushData(data, days);
}
```

---

## Option 4: Moz API

1. Get API key from [Moz](https://moz.com)
2. Install: `npm install moz-api`
3. Implement similarly to other options

---

## Data Structure Expected by Frontend

The `/api/backlinks` endpoint should return this JSON structure:

```javascript
{
  "days": 30,
  "dailyDates": ["20260120", "20260121", ...],
  "dailyBacklinks": [850, 865, 878, ...],
  "totalBacklinks": 25500,
  "newBacklinks": 3825,
  "referringDomains": 6375,
  "followBacklinks": 17340,
  "nofollowBacklinks": 8160,
  "avgDA": 42,
  "topDomains": [
    ["domain1.com", 1200, 45],
    ["domain2.com", 890, 42],
    ...
  ],
  "anchorTextDistribution": [
    ["real estate", 4500],
    ["luxury homes", 3800],
    ...
  ]
}
```

---

## Testing

1. **With Mock Data** (default):
   - Run: `node server.js`
   - Visit: `http://localhost:3000`
   - Backlinks tab shows mock data automatically

2. **With Real API**:
   - Add `GSC.env` with credentials
   - Restart server: `node server.js`
   - Dashboard will try to fetch real data
   - Falls back to mock if API fails

---

## Troubleshooting

### Issue: "API error — check server"

**Solution**:
1. Check browser console for detailed error
2. Verify API credentials in `GSC.env`
3. Ensure service account has proper permissions
4. Check server logs for error details

### Issue: Mock data keeps showing

**Solution**:
1. Verify `GSC.env` exists and has correct format
2. Test API directly: `curl http://localhost:3000/api/backlinks?days=30`
3. Check for typos in environment variables
4. Ensure credentials JSON is valid (use JSON validator)

### Issue: "private_key" is invalid

**Solution**:
1. Don't manually edit the JSON
2. Copy the entire downloaded JSON
3. Format on single line (remove actual line breaks, keep `\n` escapes)

---

## API Implementation Checklist

- [ ] Create Google Cloud Project
- [ ] Enable Search Console API
- [ ] Create Service Account & Key
- [ ] Grant GSC access to service account
- [ ] Create `GSC.env` file
- [ ] Restart server
- [ ] Test backlinks endpoint
- [ ] Verify data appears in dashboard

---

## Next Steps (Optional Enhancements)

1. **Add Historical Tracking**: Store backlinks data daily in a database
2. **Alert System**: Notify on significant backlink increases/decreases
3. **Competitor Analysis**: Compare your backlinks to competitors
4. **Link Quality Scoring**: Alert on low-quality backlinks
5. **Lost Links Detection**: Notify when quality backlinks are removed
6. **Custom Segments**: Filter by industry, geography, or domain authority

---

## Support

For issues or questions:
1. Check the API handler error logs
2. Verify credentials and permissions
3. Test API endpoint directly
4. Check third-party service status pages
