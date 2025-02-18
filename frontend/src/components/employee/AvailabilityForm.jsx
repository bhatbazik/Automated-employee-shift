import React, { useState } from 'react';
import { updateAvailability } from '../../services/api';
import { notifySuccess, notifyError } from '../common/ToastNotification';
import LoadingSpinner from '../common/LoadingSpinner';

// Remove the static daysOfWeek constant and generate week days dynamically
const shifts = ['morning', 'afternoon', 'night'];

// Generate an array of 7 days (with dynamic date and day name) starting from the given weekStartDate
const getWeekDays = (startDate) => {
  const days = [];
  const date = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    days.push({
      dayName: d.toLocaleDateString(undefined, { weekday: 'long' }),
      date: d.toISOString().split('T')[0],
    });
  }
  return days;
};

const AvailabilityForm = () => {
  const [weekStartDate, setWeekStartDate] = useState('');
  const [availability, setAvailability] = useState({}); // keys will be the dynamic date strings
  const [maxHours, setMaxHours] = useState(40);
  const [loading, setLoading] = useState(false);

  // Compute the week days only if weekStartDate is provided
  const weekDays = weekStartDate ? getWeekDays(weekStartDate) : [];

  const handleShiftChange = (date, shift) => {
    setAvailability((prev) => ({
      ...prev,
      [date]: prev[date] === shift ? null : shift,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Build availableSlots array based on the dynamic weekDays
    const availableSlots = weekDays
      .map((dayObj) => {
        const selectedShift = availability[dayObj.date];
        if (!selectedShift) return null;
        return { date: dayObj.date, slots: [selectedShift] };
      })
      .filter(Boolean);

    try {
      await updateAvailability({ weekStartDate, availableSlots, maxHours });
      notifySuccess('Availability updated');
    } catch (err) {
      notifyError('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Set Your Availability</h3>
        <p className="mt-2 text-sm text-gray-600">Select your preferred shifts for each day</p>
      </div>

      {loading && (
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
          <LoadingSpinner />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week Start Date
            </label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Working Hours Per Week
            </label>
            <input
              type="number"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
              required
              min="20"
              max="60"
            />
          </div>
        </div>

        {weekDays.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">
              Select Preferred Shift for Each Day
            </h4>
            <div className="divide-y divide-gray-200">
              {weekDays.map((day) => (
                <div key={day.date} className="py-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 w-32">
                    {day.dayName} ({day.date})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {shifts.map((shift) => (
                      <button
                        type="button"
                        key={shift}
                        onClick={() => handleShiftChange(day.date, shift)}
                        className={`
                          px-4 py-2 rounded-md text-sm font-medium transition-colors
                          ${availability[day.date] === shift 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAvailability((prev) => ({ ...prev, [day.date]: null }))}  
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${!availability[day.date]
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }
                      `}
                    >
                      Off
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Availability
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityForm;
