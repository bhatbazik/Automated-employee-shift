const ShiftSettings = require('../models/ShiftSettings');

exports.updateShiftSettings = async (req, res) => {
  try {
    const { maxEmployees } = req.body;
    let settings = await ShiftSettings.findOne();
    if (!settings) {
      settings = new ShiftSettings({ maxEmployees });
    } else {
      settings.maxEmployees = maxEmployees;
    }
    await settings.save();
    res.status(200).json({ message: 'Shift settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

exports.getShiftSettings = async (req, res) => {
  try {
    const settings = await ShiftSettings.findOne() || { maxEmployees: 3 };
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};
