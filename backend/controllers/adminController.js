const User = require("../models/User");
const Shift = require("../models/Shift");
const Availability = require("../models/Availability");
const Notification = require("../models/Notification");
const ShiftSettings = require("../models/ShiftSettings");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
};

exports.updateEmployeeSeniority = async (req, res) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.employeeId,
      { seniorityLevel: req.body.seniorityLevel },
      { new: true }
    ).select("-password");
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error updating seniority", error: error.message });
  }
};

// Helper function: Builds a fast lookup map for employee availability
const buildAvailabilityMap = (availabilities) => {
  const map = {};
  availabilities.forEach((record) => {
    record.availableSlots.forEach((slot) => {
      const key = `${record.employeeId.toString()}-${new Date(slot.date).toISOString().split('T')[0]}`;
      if (!map[key]) map[key] = new Set();
      // Add each shift individually
      slot.slots.forEach((shift) => {
        map[key].add(shift);
      });
    });
  });
  return map;
};

const getShiftTimes = (shiftType, date) => {
  const baseDate = new Date(date);
  if (shiftType === "morning") {
    return { start: new Date(baseDate.setHours(6, 0, 0, 0)), end: new Date(baseDate.setHours(14, 0, 0, 0)) };
  } else if (shiftType === "afternoon") {
    return { start: new Date(baseDate.setHours(14, 0, 0, 0)), end: new Date(baseDate.setHours(22, 0, 0, 0)) };
  } else if (shiftType === "night") {
    return { start: new Date(baseDate.setHours(22, 0, 0, 0)), 
             end: new Date(new Date(baseDate).setDate(baseDate.getDate() + 1)) };
  }
  return null;
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

exports.generateSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const employees = await User.find({ role: "employee" });
    const availabilities = await Availability.find({
      weekStartDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    
    // Retrieve shift settings without lean() so we get a full document
    const settingsDoc = await ShiftSettings.findOne();
    const maxEmployeesPerShift = settingsDoc ? Number(settingsDoc.maxEmployees) : 3;
    console.log("Max employees per shift from settings:", maxEmployeesPerShift);  // Debug log

    const availabilityMap = buildAvailabilityMap(availabilities);
    const shiftCounts = {}, employeeLastShiftEnd = {}, shiftTypeCounts = {};
    employees.forEach((emp) => {
      const id = emp._id.toString();
      shiftCounts[id] = 0;
      employeeLastShiftEnd[id] = null;
      shiftTypeCounts[id] = { morning: 0, afternoon: 0, night: 0 };
    });

    let shifts = [];
    const notifications = [];
    let currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (currentDate <= endDateTime) {
      const shiftTypes = ["morning", "afternoon", "night"];

      for (const type of shiftTypes) {
        const { start: newShiftStart, end: newShiftEnd } = getShiftTimes(type, currentDate);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        let availableEmployees = employees.filter(emp => 
          availabilityMap[`${emp._id.toString()}-${dateKey}`]?.has(type)
        );
        
        availableEmployees = availableEmployees.filter(emp => {
          const maxHours = emp.maxHoursPerWeek || 40;
          const maxShifts = Math.min(Math.floor(maxHours / 8), 5);
          return shiftCounts[emp._id.toString()] < maxShifts;
        });
      
        availableEmployees = availableEmployees.filter(emp => {
          const lastEnd = employeeLastShiftEnd[emp._id.toString()];
          return !lastEnd || newShiftStart - lastEnd >= 12 * 3600 * 1000;
        });
      
        // New notification for no eligible employees
        if (availableEmployees.length === 0) {
          notifications.push({
            message: `No eligible employees available for ${type} shift on ${currentDate.toDateString()}`,
            date: new Date(),
            status: "pending",
          });
          continue;
        }
      
        const availableSeniors = availableEmployees.filter(emp => emp.seniorityLevel === "senior");
        if (availableSeniors.length === 0) {
          notifications.push({
            message: `No senior available for ${type} shift on ${currentDate.toDateString()}`,
            date: new Date(),
            status: "pending",
          });
          continue;
        }
        
        // Existing logic: Shuffle, sort, and select employees
        shuffle(availableEmployees);
        availableEmployees.sort((a, b) => {
          return shiftCounts[a._id.toString()] - shiftCounts[b._id.toString()] || 
                 shiftTypeCounts[a._id.toString()][type] - shiftTypeCounts[b._id.toString()][type];
        });
        availableSeniors.sort((a, b) => shiftCounts[a._id.toString()] - shiftCounts[b._id.toString()]);
        const selectedSenior = availableSeniors[0];
        const selectedEmployees = [selectedSenior._id];
      
        availableEmployees = availableEmployees.filter(emp => emp._id.toString() !== selectedSenior._id.toString());
        for (let emp of availableEmployees) {
          if (selectedEmployees.length >= maxEmployeesPerShift) break;
          selectedEmployees.push(emp._id);
        }
      
        // New notification: Partially filled shift
        if (selectedEmployees.length < maxEmployeesPerShift) {
          notifications.push({
            message: `Shift on ${currentDate.toDateString()} (${type}) is partially filled (${selectedEmployees.length}/${maxEmployeesPerShift})`,
            date: new Date(),
            status: "pending",
          });
        }
      
        selectedEmployees.forEach(empId => {
          const idStr = empId.toString();
          shiftCounts[idStr]++;
          shiftTypeCounts[idStr][type]++;
          employeeLastShiftEnd[idStr] = newShiftEnd;
        });
      
        if (selectedEmployees.length >= 1) {
          shifts.push({ 
            date: new Date(currentDate), 
            type, 
            employees: selectedEmployees, 
            status: "confirmed", 
            minEmployees: 1, 
            maxEmployees: maxEmployeesPerShift 
          });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Avoid inserting duplicate shifts
    const existingShifts = await Shift.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    const existingShiftMap = new Map();
    existingShifts.forEach((shift) => {
      existingShiftMap.set(`${shift.date.toISOString().split('T')[0]}-${shift.type}`, true);
    });
    const uniqueShifts = shifts.filter(
      (shift) => !existingShiftMap.has(`${shift.date.toISOString().split('T')[0]}-${shift.type}`)
    );
    if (uniqueShifts.length) await Shift.insertMany(uniqueShifts);
    if (notifications.length) await Notification.insertMany(notifications);

    // Requery shifts with populated employee names
    const populatedShifts = await Shift.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('employees', 'name email');
    
    res.status(200).json({ message: "Schedule generated", shifts: populatedShifts, notifications });
  } catch (error) {
    res.status(500).json({ message: "Error generating schedule", error: error.message });
  }
};
