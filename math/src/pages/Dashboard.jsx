import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token or user session (if implemented)
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to Geonix!</h1>
      <p className="mb-6">Here’s your learning dashboard.</p>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Link to="/practice" className="p-4 bg-blue-100 rounded-xl hover:bg-blue-200 transition">
          📘 Practice Questions
        </Link>
        <Link to="/score" className="p-4 bg-green-100 rounded-xl hover:bg-green-200 transition">
          🧮 Score Summary
        </Link>
        <Link to="/profile" className="p-4 bg-yellow-100 rounded-xl hover:bg-yellow-200 transition">
          👤 Profile
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
