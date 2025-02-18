import React, { useState, useEffect } from 'react';
import { fetchShifts } from '../../services/api';
import { notifyError } from '../common/ToastNotification';
import LoadingSpinner from '../common/LoadingSpinner';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });

  const getShifts = async () => {
    if (!dates.start || !dates.end) return;
    setLoading(true);
    try {
      const res = await fetchShifts({ startDate: dates.start, endDate: dates.end });
      // Remove duplicate shifts based on date and type
      const uniqueShifts = res.data.reduce((acc, shift) => {
        if (!acc.some(s => s.date === shift.date && s.type === shift.type)) {
          acc.push(shift);
        }
        return acc;
      }, []);
      setShifts(uniqueShifts);
    } catch (err) {
      notifyError('Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dates.start && dates.end) {
      getShifts();
    }
  }, [dates]);

  const shiftTypeStyles = {
    morning: 'bg-yellow-100 text-yellow-800',
    afternoon: 'bg-blue-100 text-blue-800',
    night: 'bg-gray-200 text-gray-800'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg my-6">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">Your Shifts</h3>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-6">
  <div className="flex flex-col space-y-1">
    <label className="font-medium text-gray-700">Start Date:</label>
    <input
      type="date"
      value={dates.start}
      onChange={(e) => setDates({ ...dates, start: e.target.value })}
      className="p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div className="flex flex-col space-y-1">
    <label className="font-medium text-gray-700">End Date:</label>
    <input
      type="date"
      value={dates.end}
      onChange={(e) => setDates({ ...dates, end: e.target.value })}
      className="p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <button
    onClick={getShifts}
    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all"
  >
    Fetch Shifts
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
                key={shift._id ? shift._id : `${shift.date}-${shift.type}-${index}`}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-lg transition duration-300"
              >
                <div className="mb-2">
                  <span className="font-semibold">Date: </span>
                  <span>{new Date(shift.date).toLocaleDateString()}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Shift Type: </span>
                  <span className={`capitalize font-medium px-2 py-1 rounded ${shiftTypeStyles[shift.type]}`}>
                    {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Employees: </span>
                  {shift.employees && shift.employees.length > 0 ? (
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
                  ) : (
                    <span className="text-red-500 font-bold">failed</span>
                  )}
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
  );
};

export default ShiftList;
