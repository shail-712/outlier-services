const Country = require('../models/Country');

// GET /api/countries
// Matches shape of countries.json: array of { Country_Code, Country_Name, Region_Code, Currency_Code }
exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.find(
      {},
      'Country_Code Country_Name Region_Code Currency_Code -_id'
    ).lean();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countries', details: err.message });
  }
};
