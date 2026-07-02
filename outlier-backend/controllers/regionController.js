const Region = require('../models/Region');

// GET /api/regions
// Matches shape of regions.json: array of { Region_Code, Region_Name }
exports.getRegions = async (req, res) => {
  try {
    const regions = await Region.find({}, 'Region_Code Region_Name -_id').lean();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch regions', details: err.message });
  }
};
