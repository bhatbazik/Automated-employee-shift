const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  availableSlots: [{
    date: {
      type: Date,
      required: true
    },
    slots: [{
      type: String,
      enum: ['morning', 'afternoon', 'night']
    }]
  }],
  // New field: employees can set their preferred max working hours per week
  maxWorkingHours: {
    type: Number,
    required: true,
    default: 40,
    min: 20,
    max: 60
  }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
