import React, { useState } from "react";
import { generateSchedule } from "../../services/api";
import { notifySuccess, notifyError } from "../common/ToastNotification";
import LoadingSpinner from "../common/LoadingSpinner";
import BackButton from "../common/BackButton";

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });

  const handleGenerate = async () => {
    if (!dates.start || !dates.end) {
      notifyError("Please select both start and end dates");
      return;
    }

    setLoading(true);

    try {
      const { data } = await generateSchedule({
        startDate: dates.start,
        endDate: dates.end,
      });

      notifySuccess("Schedule generated successfully");
      setShifts(data.shifts || []);
      setNotifications(data.notifications || []);
    } catch (err) {
      notifyError("Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  // Dummy delete handler; integrate with your delete API as needed.
  const handleDeleteNotification = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="p-6">
        <BackButton fallback="/admin" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Schedule Generator Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">
            Generated Shifts
          </h3>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="space-y-1">
              <label className="block font-medium text-blue-600">
                Start Date:
              </label>
              <input
                type="date"
                value={dates.start}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-blue-600">
                End Date:
              </label>
              <input
                type="date"
                value={dates.end}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="self-end bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Generate Schedule
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {shifts.length > 0 ? (
                shifts.map((shift, index) => (
                  <div
                    key={
                      shift._id
                        ? shift._id
                        : `${shift.date}-${shift.type}-${index}`
                    }
                    className="bg-gray-50 p-4 rounded-lg border border-blue-200 hover:shadow-lg transition duration-300"
                  >
                    <div className="mb-2">
                      <span className="font-semibold">Date: </span>
                      <span>{new Date(shift.date).toLocaleDateString()}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Shift Type: </span>
                      <span className="capitalize">{shift.type}</span>
                    </div>
                    {/* Only display employees if available */}
                    {shift.employees && shift.employees.length > 0 ? (
                      <div className="mb-2">
                        <span className="font-semibold">Employees: </span>
                        <div className="flex flex-wrap gap-2">
                          {shift.employees.map((emp, i) => (
                            <div
                              key={emp._id ? emp._id : i}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                            >
                              {emp.name || emp}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div>
                      <span className="font-semibold">Status: </span>
                      <span
                        className={`capitalize font-bold ${
                          shift.employees &&
                          shift.employees.length > 0 &&
                          shift.status === "confirmed"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {shift.employees && shift.employees.length > 0
                          ? shift.status
                          : "failed"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-blue-500 p-4">
                  No shifts available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full lg:w-1/3">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">
            Notifications
          </h3>

          {notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className="p-3 border rounded bg-blue-100 text-blue-800 flex justify-between items-center"
                >
                  <span>{notification.message}</span>
                  <button
                    onClick={() => handleDeleteNotification(index)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-blue-500">No notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftList;
