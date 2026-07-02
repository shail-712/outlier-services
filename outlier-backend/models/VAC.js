const mongoose = require('mongoose');

const VACSchema = new mongoose.Schema(
  {
    VAC_Code: { type: String, required: true, unique: true, index: true },
    VAC_Name: { type: String, required: true },
    Country_Code: { type: String, required: true, index: true },

    Country_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VAC', VACSchema);
