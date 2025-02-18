import React, { useState, useEffect } from "react";
import axios from "axios";
import { notifySuccess, notifyError } from "../common/ToastNotification";
import BackButton from "../common/BackButton";
import LoadingSpinner from "../common/LoadingSpinner";

const ShiftSettings = () => {
  const [maxEmployees, setMaxEmployees] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch existing shift settings from the backend
    const fetchSettings = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
          { withCredentials: true }
        );
        setMaxEmployees(response.data.maxEmployees || 3);
      } catch (error) {
        notifyError("Failed to load shift settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Send the field as "maxEmployees" to match the backend model
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
        { maxEmployees },
        { withCredentials: true }
      );
      notifySuccess("Shift settings updated successfully");
    } catch (error) {
      console.error("Error updating shift settings:", error);
      notifyError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="p-6">
        <BackButton fallback="/admin" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Shift Settings</h3>
          <p className="mt-1 text-sm text-gray-600">Configure shift parameters</p>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Employees Per Shift(currently only uses hardcoded value of 3)
              </label>
              <input
                type="number"
                value={maxEmployees}
                onChange={(e) => setMaxEmployees(Number(e.target.value))}
                min="1"
                max="10"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSettings;
