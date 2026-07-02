const Service = require('../models/Service');

// GET /api/services?country=XX
// Matches shape of services.json: array of
// { Service_Code, Service_Name, Service_Type, Currency_Code, Unit_Price, Country_Code }
exports.getServices = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { Country_Code: String(country).toUpperCase() } : {};

    const services = await Service.find(
      filter,
      'Service_Code Service_Name Service_Type Currency_Code Unit_Price Country_Code -_id'
    ).lean();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services', details: err.message });
  }
};
