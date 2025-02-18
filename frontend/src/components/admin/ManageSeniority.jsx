import React, { useState, useEffect } from 'react';
import { notifySuccess, notifyError } from '../common/ToastNotification';
import { updateSeniority } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import axios from 'axios';
import BackButton from '../common/BackButton';

const ManageSeniority = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/employees`, { withCredentials: true });
      setEmployees(res.data);
    } catch (err) {
      notifyError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSeniorityChange = async (employeeId, seniorityLevel) => {
    try {
      await updateSeniority(employeeId, { seniorityLevel });
      notifySuccess('Seniority updated');
      fetchEmployees();
    } catch (err) {
      notifyError('Failed to update seniority');
    }
  };

  const getSeniorityColor = (level) => {
    switch (level) {
      case 'junior': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-purple-100 text-purple-800';
      case 'senior': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
       <div className="p-6">
      <BackButton fallback="/admin" />
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
    </div>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Manage Employee Seniority</h3>
              <p className="mt-1 text-sm text-gray-600">
                Update and manage employee seniority levels
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">Junior</span>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">Mid-Level</span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800">Senior</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Update Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {emp.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {emp.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeniorityColor(emp.seniorityLevel)}`}>
                          {emp.seniorityLevel.charAt(0).toUpperCase() + emp.seniorityLevel.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={emp.seniorityLevel}
                          onChange={(e) => handleSeniorityChange(emp._id, e.target.value)}
                          className="block w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                   transition-colors duration-200"
                        >
                          <option value="junior">Junior</option>
                          <option value="mid">Mid-Level</option>
                          <option value="senior">Senior</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSeniority;
