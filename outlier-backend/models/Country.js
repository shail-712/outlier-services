const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema(
  {
    Country_Code: { type: String, required: true, unique: true, index: true },
    Country_Name: { type: String, required: true },
    Region_Code: { type: String, required: true, index: true },
    Currency_Code: { type: String, required: true, index: true },

    // ObjectId refs for population/joins when needed, alongside the codes
    Region_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
    Currency_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', CountrySchema);
