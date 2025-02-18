import React, { useState, useEffect } from 'react';
import AvailabilityForm from './AvailabilityForm';
import ShiftList from './ShiftList';
import { fetchProfile } from '../../services/api';
import { notifyError } from '../common/ToastNotification';
import LoadingSpinner from '../common/LoadingSpinner';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      try {
        const res = await fetchProfile();
        setProfile(res.data);
      } catch (err) {
        notifyError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center mt-10">No profile found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-blue-600">
          Welcome, {profile.name}
        </h2>
        <div className="space-y-8">
          <div className="border-b pb-8">
            <AvailabilityForm />
          </div>
          <div>
            <ShiftList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
