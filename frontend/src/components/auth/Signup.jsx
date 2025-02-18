import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../../services/api';
import { notifySuccess, notifyError } from '../common/ToastNotification';
import LoadingSpinner from '../common/LoadingSpinner';

const Signup = () => {
 const [formData, setFormData] = useState({
   name: '',
   email: '',
   password: '',
   role: 'employee',
   seniorityLevel: 'junior', 
   maxHoursPerWeek: 40,
 });
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

 const handleChange = (e) =>
   setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     await signupUser(formData);
     notifySuccess('Signup successful, please log in.');
     navigate('/login');
   } catch (err) {
     notifyError(err.response?.data?.message || 'Signup failed');
   } finally {
     setLoading(false);
   }
 };

 return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
     <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
       <div>
         <h2 className="text-3xl font-extrabold text-gray-900 text-center">
           Create Account
         </h2>
         <p className="mt-2 text-center text-sm text-gray-600">
           Join us and start managing your shifts
         </p>
       </div>

       {loading && <LoadingSpinner />}

       <form onSubmit={handleSubmit} className="mt-8 space-y-6">
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700">
               Full Name
             </label>
             <input
               type="text"
               name="name"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                        shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition duration-150 ease-in-out"
               value={formData.name}
               onChange={handleChange}
               required
               placeholder="Enter your full name"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">
               Email Address
             </label>
             <input
               type="email"
               name="email"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                        shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition duration-150 ease-in-out"
               value={formData.email}
               onChange={handleChange}
               required
               placeholder="Enter your email"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">
               Password
             </label>
             <input
               type="password"
               name="password"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                        shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition duration-150 ease-in-out"
               value={formData.password}
               onChange={handleChange}
               required
               placeholder="Create a password"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">
               Max Hours Per Week
             </label>
             <input
               type="number"
               name="maxHoursPerWeek"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                        shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition duration-150 ease-in-out"
               value={formData.maxHoursPerWeek}
               onChange={handleChange}
               required
               min="20"
               max="40"
               placeholder="Enter hours (20-40)"
             />
             <p className="mt-1 text-xs text-gray-500">
               Choose between 20-40 hours per week
             </p>
           </div>
         </div>

         <button
           type="submit"
           disabled={loading}
           className="w-full flex justify-center py-2.5 px-4 border border-transparent 
                    rounded-md shadow-sm text-sm font-medium text-white
                    bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transform transition duration-150 hover:scale-[1.02]"
         >
           {loading ? 'Creating account...' : 'Create Account'}
         </button>
       </form>

       <div className="mt-6">
         <p className="text-center text-sm text-gray-600">
           Already have an account?{' '}
           <Link 
             to="/login" 
             className="font-medium text-blue-600 hover:text-blue-500 
                        transition duration-150 ease-in-out"
           >
             Sign in
           </Link>
         </p>
       </div>
     </div>
   </div>
 );
};

export default Signup;