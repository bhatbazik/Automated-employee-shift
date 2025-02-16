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
  }]
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
