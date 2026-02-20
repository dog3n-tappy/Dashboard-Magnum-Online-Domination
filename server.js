const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import API handlers
const ga4Handler = require('./api/ga4');
const backlinksHandler = require('./api/backlinks');

// Route GA4 requests to the real API
app.get('/api/ga4', ga4Handler);

// Route backlinks requests to the backlinks API
app.get('/api/backlinks', backlinksHandler);

app.listen(PORT, () => {
  console.log(`🚀 Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 GA4 connected - Property ID: ${process.env.GA4_PROPERTY_ID}`);
  console.log(`🔗 Backlinks API available - ${process.env.GSC_SITE_URL || 'Not configured'}`);
});

