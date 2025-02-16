const User = require('../models/User');
const Shift = require('../models/Shift');
const Availability = require('../models/Availability');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOneAndUpdate(
      { employeeId: req.user.id, weekStartDate: req.body.weekStartDate },
      { ...req.body, employeeId: req.user.id },
      { new: true, upsert: true }
    );
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};

exports.getShifts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const shifts = await Shift.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      employees: req.user.id
    }).populate('employees', 'name email');
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shifts', error: error.message });
  }
};
