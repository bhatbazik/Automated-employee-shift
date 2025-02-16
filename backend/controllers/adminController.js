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

    // Fetch all employees and their availabilities for the period in one go
    const employees = await User.find({ role: "employee" });
    const availabilities = await Availability.find({
      weekStartDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    // Track number of shifts and the last shift's end time for each employee
    const shiftCounts = {};
    const employeeLastShiftEnd = {}; // Map of employeeId to Date of last shift's end
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
        const { start: newShiftStart, end: newShiftEnd } = getShiftTimes(
          type,
          currentDate
        );

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

        // Enforce max 5 shifts per week per employee
        availableEmployees = availableEmployees.filter(
          (emp) => shiftCounts[emp._id.toString()] < 5
        );

        // Enforce a minimum 12-hour gap from the employee's last assigned shift
        availableEmployees = availableEmployees.filter((emp) => {
          const lastEnd = employeeLastShiftEnd[emp._id.toString()];
          if (!lastEnd) return true;
          return newShiftStart - lastEnd >= 12 * 3600 * 1000; // 12 hours in milliseconds
        });

        // Sort by least assigned shifts for fairness
        availableEmployees.sort(
          (a, b) =>
            shiftCounts[a._id.toString()] - shiftCounts[b._id.toString()]
        );

        // Ensure at least one senior employee is included, if available
        let selectedEmployees = [];
        const seniors = availableEmployees.filter(
          (emp) => emp.seniorityLevel === "senior"
        );
        if (seniors.length > 0) {
          selectedEmployees.push(seniors[0]._id);
          // Remove the selected senior from the available list
          availableEmployees = availableEmployees.filter(
            (emp) => emp._id.toString() !== seniors[0]._id.toString()
          );
        } else {
          // Add a notification for employees if no senior is available
          availableEmployees.forEach(async (emp) => {
            await User.findByIdAndUpdate(emp._id, {
              $push: {
                notifications: {
                  message: `No senior available for ${type} shift on ${currentDate.toDateString()}`,
                },
              },
            });
          });
        }

        // Define maximum employees per shift (fixed value for simplicity)
        const maxEmployees = 3;
        // Fill remaining slots from available employees
        for (let emp of availableEmployees) {
          if (selectedEmployees.length >= maxEmployees) break;
          selectedEmployees.push(emp._id);
        }

        // Update shift count and last shift end time for assigned employees
        selectedEmployees.forEach((empId) => {
          const empIdStr = empId.toString();
          shiftCounts[empIdStr]++;
          employeeLastShiftEnd[empIdStr] = newShiftEnd;
        });

        // Create the shift if the minimum employee requirement is met (assumed 1 here)
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
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json(shifts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating schedule", error: error.message });
  }
};
