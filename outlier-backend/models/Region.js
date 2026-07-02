const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema(
  {
    Region_Code: { type: String, required: true, unique: true, index: true },
    Region_Name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Region', RegionSchema);
