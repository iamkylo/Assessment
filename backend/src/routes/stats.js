const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache for stats
let statsCache = null;
let cacheTimestamp = null;

// Calculate stats from items
function calculateStats(items) {
  if (!items || items.length === 0) {
    return { total: 0, averagePrice: 0, categories: {} };
  }

  const total = items.length;
  const totalPrice = items.reduce((acc, cur) => acc + cur.price, 0);
  const averagePrice = Math.round((totalPrice / total) * 100) / 100;

  // Group by category
  const categories = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return { total, averagePrice, categories };
}

// Invalidate cache when file changes
fs.watch(DATA_PATH, { persistent: false }, (eventType) => {
  if (eventType === 'change') {
    console.log('Data file changed, invalidating stats cache');
    statsCache = null;
    cacheTimestamp = null;
  }
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Return cached stats if available
    if (statsCache) {
      return res.json({
        ...statsCache,
        cached: true,
        cachedAt: cacheTimestamp
      });
    }

    // Read data and calculate stats
    const raw = await fsPromises.readFile(DATA_PATH, 'utf-8');
    const items = JSON.parse(raw);
    const stats = calculateStats(items);

    // Cache the results
    statsCache = stats;
    cacheTimestamp = new Date().toISOString();

    res.json({
      ...stats,
      cached: false,
      cachedAt: cacheTimestamp
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;