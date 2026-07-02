const VAC = require('../models/VAC');

// GET /api/vacs?country=XX
// Matches shape of vacs.json: array of { VAC_Code, VAC_Name, Country_Code }
exports.getVACs = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { Country_Code: String(country).toUpperCase() } : {};

    const vacs = await VAC.find(filter, 'VAC_Code VAC_Name Country_Code -_id').lean();
    res.json(vacs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch VACs', details: err.message });
  }
};
