const User = require("../models/User");
const Shift = require("../models/Shift");
const Availability = require("../models/Availability");

// Helper function to determine shift start and end times based on shift type
const getShiftTimes = (shiftType, date) => {
  const baseDate = new Date(date);
  if (shiftType === "morning") {
    const start = new Date(baseDate);
    start.setHours(6, 0, 0, 0);
    const end = new Date(baseDate);
    end.setHours(14, 0, 0, 0);
    return { start, end };
  } else if (shiftType === "afternoon") {
    const start = new Date(baseDate);
    start.setHours(14, 0, 0, 0);
    const end = new Date(baseDate);
    end.setHours(22, 0, 0, 0);
    return { start, end };
  } else if (shiftType === "night") {
    const start = new Date(baseDate);
    start.setHours(22, 0, 0, 0);
    const end = new Date(baseDate);
    end.setDate(end.getDate() + 1); // Ends on the next day
    end.setHours(6, 0, 0, 0);
    return { start, end };
  }
  return null;
};

// Simple shuffle function (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
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

    // Fetch all employees and availabilities for the period
    const employees = await User.find({ role: "employee" });
    const availabilities = await Availability.find({
      weekStartDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    // Track shift counts and last shift end time per employee
    const shiftCounts = {};
    const employeeLastShiftEnd = {};
    employees.forEach((emp) => {
      shiftCounts[emp._id.toString()] = 0;
      employeeLastShiftEnd[emp._id.toString()] = null;
    });

    const shifts = [];
    let currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (currentDate <= endDateTime) {
      const shiftTypes = ["morning", "afternoon", "night"];

      for (const type of shiftTypes) {
        const { start: newShiftStart, end: newShiftEnd } = getShiftTimes(type, currentDate);

        // Filter employees available on this day for the given shift
        let availableEmployees = employees.filter((employee) => {
          const empAvailability = availabilities.find(
            (a) =>
              a.employeeId.toString() === employee._id.toString() &&
              a.availableSlots.some(
                (slot) =>
                  slot.date.toDateString() === currentDate.toDateString() &&
                  slot.slots.includes(type)
              )
          );
          return !!empAvailability;
        });

        availableEmployees = availableEmployees.filter(emp => {
          const avail = availabilities.find(a => a.employeeId.toString() === emp._id.toString());
          // Use the maxWorkingHours from availability if provided, otherwise fallback to emp.maxHoursPerWeek
          const maxHours = (avail && avail.maxWorkingHours) || (emp.maxHoursPerWeek || 40);
          const maxShifts = Math.floor(maxHours / 8);
          return shiftCounts[emp._id.toString()] < maxShifts;
        });
        

        // Enforce a minimum 12-hour gap from the employee's last assigned shift
        availableEmployees = availableEmployees.filter((emp) => {
          const lastEnd = employeeLastShiftEnd[emp._id.toString()];
          if (!lastEnd) return true;
          return newShiftStart - lastEnd >= 12 * 3600 * 1000;
        });

        // Shuffle to randomize order
        availableEmployees = shuffle(availableEmployees);

        // Sort by least assigned shifts for fairness
        availableEmployees.sort(
          (a, b) =>
            shiftCounts[a._id.toString()] - shiftCounts[b._id.toString()]
        );

        // Ensure at least one senior is included (choose a random senior from the available ones)
        let selectedEmployees = [];
        const availableSeniors = availableEmployees.filter(
          (emp) => emp.seniorityLevel === "senior"
        );
        if (availableSeniors.length > 0) {
          const shuffledSeniors = shuffle(availableSeniors);
          selectedEmployees.push(shuffledSeniors[0]._id);
          // Remove the selected senior so they aren't chosen again
          availableEmployees = availableEmployees.filter(
            (emp) => emp._id.toString() !== shuffledSeniors[0]._id.toString()
          );
        } else {
          // Notify employees if no senior is available (optional)
          availableEmployees.forEach(async (emp) => {
            await User.findByIdAndUpdate(emp._id, {
              $push: {
                notifications: {
                  message: `No senior available for ${type} shift on ${currentDate.toDateString()}`
                },
              },
            });
          });
        }

        // Define maximum employees per shift (for example, 3)
        const maxEmployees = 3;
        // Fill remaining slots from available employees
        for (let emp of availableEmployees) {
          if (selectedEmployees.length >= maxEmployees) break;
          selectedEmployees.push(emp._id);
        }

        // Update shift counts and last shift end time for assigned employees
        selectedEmployees.forEach((empId) => {
          const empIdStr = empId.toString();
          shiftCounts[empIdStr]++;
          employeeLastShiftEnd[empIdStr] = newShiftEnd;
        });

        // Create the shift if minimum requirement is met (minEmployees = 1)
        const minEmployees = 1;
        if (selectedEmployees.length >= minEmployees) {
          const shift = await Shift.create({
            date: new Date(currentDate),
            type,
            employees: selectedEmployees,
            status: "confirmed",
            minEmployees,
            maxEmployees,
          });
          shifts.push(shift);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Error generating schedule", error: error.message });
  }
};