Core Requirements & How They Are Handled
✅ 1. Optimized Weekly Schedule with Constraints
The system dynamically assigns shifts while following key rules:

At least one senior employee per shift

The algorithm ensures at least one senior is assigned to every shift.
If no senior is available, the system sends a notification and skips generating that shift.
No consecutive shifts exceeding 8 hours (Minimum 12-hour gap required)

Employees must have at least 12 hours of rest between shifts.
The system checks the last assigned shift’s end time before scheduling a new one.
Max 5 shifts per employee per week

Employees can work a maximum of 40 hours (5 shifts of 8 hours each).
The system tracks assigned shifts and ensures no one exceeds this limit.
Fair distribution of shifts (No one gets all night shifts)

The algorithm distributes shifts evenly across employees so that no one is assigned only night shifts.
Sorting and balancing methods ensure fairness in assignments.
Respecting min/max employees per shift

The system assigns at least the minimum required employees to each shift.
It does not exceed the maximum limit (e.g., 3 employees per shift).
If a shift cannot be filled due to constraints, it is left unassigned rather than understaffed.
2. Dynamic Adjustments to Employee Preferences
✅ Handled by the System:

If an employee updates preferred shifts, max working hours, or availability, the schedule automatically adjusts.
The backend re-reads all availability data and updates the assignments accordingly.
Uses upsert operations to dynamically store changes and avoid duplication.
🔹 Potential Enhancement:

Implement real-time updates so shifts are reallocated instantly when availability changes, instead of waiting for the next full recalculation.
3. Ensuring All Shifts Are Filled If Possible
✅ Current Approach:

The scheduling logic assigns as many employees as possible without violating constraints.
If no eligible employees exist for a shift, it is not created, ensuring compliance with availability.
🔹 Potential Enhancement:

Consider a secondary assignment strategy where employees are offered shifts they didn’t initially prefer (if they have remaining hours).
4. Employee Notifications When Preferences Aren’t Met
✅ Currently Implemented:

The system sends notifications when a shift lacks a senior employee.
🔹 Enhancement Needed:

Expand notifications to other unmet preferences, such as:
If an employee’s preferred shifts were not fully assigned.
If they were assigned fewer hours than requested.
5. Efficient Algorithm (No Brute Force Approach)
✅ Well-Designed Scheduling Logic:

Uses sorting, filtering, and shuffling to create a balanced schedule.
Ensures no static/predefined assignments—every shift is generated dynamically.
Recalculates schedules based on current employee availability rather than using a fixed template.
🔹 Potential Enhancement:

Add debug logging to track decision-making in shift assignments, making troubleshooting easier.
Final Conclusion
✅ What Works Well:

All core constraints are respected.
The system dynamically adjusts shifts when availability changes.
Shifts are distributed fairly across employees.
Notifications exist (but only for missing seniors).
🔹 What Can Be Improved:

Broaden notification triggers to inform employees when preferences aren’t fully met.
Implement real-time schedule updates when availability changes.
Add a fallback method to prevent unfilled shifts.
Allow configurable limits (e.g., max employees per shift) rather than hardcoding values.