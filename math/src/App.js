import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Practice from './components/Practice/Practice';
import Score from './pages/Score/Score';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import { UserProvider } from './components/UserContext/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>

        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />
         <Route
  path="/login"
  element={<Login />}
/>

<Route
  path="/signup"
  element={<Signup />}
/>
          {/* Dashboard */}
         <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

          {/* Practice */}
          <Route
  path="/practice"
  element={
    <ProtectedRoute>
      <Practice />
    </ProtectedRoute>
  }
/>

          {/* Score */}
          <Route
  path="/score"
  element={
    <ProtectedRoute>
      <Score />
    </ProtectedRoute>
  }
/>

          {/* Profile */}
          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
        </Routes>

      </Router>
    </UserProvider>
  );
}

export default App;