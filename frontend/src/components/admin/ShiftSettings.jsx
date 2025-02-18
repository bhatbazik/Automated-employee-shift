import React, { useState } from 'react';
import { notifySuccess } from '../common/ToastNotification';
import BackButton from '../common/BackButton';
const ShiftSettings = () => {
  const [maxEmployees, setMaxEmployees] = useState(3);
  const [shiftDuration, setShiftDuration] = useState(8);
  const [breakDuration, setBreakDuration] = useState(60);
  
  const handleSave = () => {
    notifySuccess('Shift settings updated successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="p-6">
      <BackButton fallback="/admin" />
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
    </div>
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Shift Settings</h3>
            <p className="mt-1 text-sm text-gray-600">
              Configure your organization's shift parameters
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Employees Per Shift
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={maxEmployees}
                  onChange={(e) => setMaxEmployees(e.target.value)}
                  min="1"
                  max="10"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-colors duration-200"
                  placeholder="Enter maximum employees"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: 3 employees per shift
                </p>
              </div>
            </div>

            

           
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent 
                         rounded-md shadow-sm text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         transform transition duration-150 hover:scale-[1.02]"
              >
                Save Settings
              </button>
              <p className="mt-2 text-xs text-center text-gray-500">
                Changes will apply to future shift schedules
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            About Shift Settings
          </h4>
          <p className="text-sm text-blue-600">
            These settings determine how shifts are scheduled and managed. Ensure compliance 
            with local labor laws when configuring shift durations and break times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShiftSettings;