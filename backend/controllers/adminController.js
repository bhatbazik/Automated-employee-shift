const User = require("../models/User");
const Shift = require("../models/Shift");
const Availability = require("../models/Availability");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

exports.updateEmployeeSeniority = async (req, res) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.employeeId,
      { seniorityLevel: req.body.level },
      { new: true }
    ).select("-password");
    res.status(200).json(employee);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating seniority", error: error.message });
  }
};

exports.generateSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Get all employees and their availabilities
    const employees = await User.find({ role: "employee" });
    const availabilities = await Availability.find({
      weekStartDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    // Simple scheduling algorithm (you might want to make this more sophisticated)
    const shifts = [];
    const currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (currentDate <= endDateTime) {
      const shiftTypes = ["morning", "afternoon", "night"];

      for (const type of shiftTypes) {
        const availableEmployees = employees.filter((employee) => {
          const employeeAvailability = availabilities.find(
            (a) =>
              a.employeeId.toString() === employee._id.toString() &&
              a.availableSlots.some(
                (slot) =>
                  slot.date.toDateString() === currentDate.toDateString() &&
                  slot.slots.includes(type)
              )
          );
          return employeeAvailability;
        });

        if (availableEmployees.length > 0) {
          const shift = await Shift.create({
            date: new Date(currentDate),
            type,
            employees: availableEmployees.slice(0, 3).map((e) => e._id),
            status: "confirmed",
            minEmployees: 1,
            maxEmployees: 3,
          });
          shifts.push(shift);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json(shifts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating schedule", error: error.message });
  }
};
