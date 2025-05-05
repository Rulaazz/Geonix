import React, { createContext, useState, useEffect, useContext } from 'react'; // Add useEffect here

// Create context
const UserContext = createContext();

// Custom hook to access user context
export const useUser = () => {
  return useContext(UserContext); // Returns user context
};

// UserProvider component that provides the user state to the rest of the app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize user state

  // Example of simulating user login (replace this with your actual logic)
  useEffect(() => {
    const fetchUser = async () => {
      // Simulating an API call
      const fetchedUser = { name: 'John Doe', role: 'admin' }; // Mocked user data
      setUser(fetchedUser);
    };

    fetchUser(); // Fetch user on component mount
  }, []); // Empty dependency array means this runs once on mount

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};