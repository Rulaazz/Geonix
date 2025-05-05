import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('user'));
    if (saved) setUser(saved);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('user', JSON.stringify(user));
    alert('Profile saved!');
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">👤 Edit Profile</h1>
      <div className="mb-4">
        <label className="block font-medium mb-1">Name</label>
        <input name="name" value={user.name} onChange={handleChange} className="p-2 border rounded w-full" />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Email</label>
        <input name="email" value={user.email} onChange={handleChange} className="p-2 border rounded w-full" />
      </div>
      <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Save
      </button>
    </div>
  );
};

export default Profile;
