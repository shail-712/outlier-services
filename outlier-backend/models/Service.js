const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    Service_Code: { type: String, required: true, unique: true, index: true },
    Service_Name: { type: String, required: true },
    Service_Type: { type: String, enum: ['VAS'], default: 'VAS', required: true },
    Currency_Code: { type: String, required: true, index: true },
    Unit_Price: { type: Number, required: true, min: 0 },
    Country_Code: { type: String, required: true, index: true },

    Country_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    Currency_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
