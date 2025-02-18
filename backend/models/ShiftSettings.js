const mongoose = require('mongoose');

const ShiftSettingsSchema = new mongoose.Schema({
  maxEmployees: { type: Number, default: 3 }
});

module.exports = mongoose.model('ShiftSettings', ShiftSettingsSchema);
