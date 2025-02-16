const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    required: true
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending'
  },
  minEmployees: {
    type: Number,
    required: true
  },
  maxEmployees: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);