
import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { UserProvider } from './components/UserContext/UserContext';
import Layout from './components/Layout/Layout';

import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Practice from './components/Practice/Practice';
import Score from './pages/Score/Score';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Profile from './pages/Profile/Profile';

import VideoLessons from './components/VideoLesson/VideoLessons';
import VideoLesson from './pages/VideoLesson/VideoLesson';

import Instructors from './pages/Instructors/Instructors';
import InstructorDetails from './pages/InstructorDetails/InstructorDetails';
import InstructorSetup from './pages/InstructorSetup/InstructorSetup';
import InstructorDashboard from './pages/InstructorDashboard/InstructorDashboard';

import MyLessons from './pages/MyLessons/MyLessons';
import Classroom from './pages/Classroom/Classroom';

import Pricing from './pages/Pricing/Pricing';
import MyPayments from './pages/MyPayments/MyPayments';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Contact from './pages/Contact/Contact';

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            {/* =========================
                PUBLIC PAGES
            ========================= */}

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

            {/* =========================
                CONTACT
            ========================= */}

            <Route
              path="/contact"
              element={<Contact />}
            />

            {/* =========================
                STUDENT DASHBOARD
            ========================= */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* =========================
                MATH PRACTICE
            ========================= */}

            <Route
              path="/practice"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Practice />
                </ProtectedRoute>
              }
            />

            {/* =========================
                STUDENT PROGRESS
            ========================= */}

            <Route
              path="/score"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Score />
                </ProtectedRoute>
              }
            />

            {/* =========================
                USER PROFILE
            ========================= */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* =========================
                PRICING AND OFFERS
            ========================= */}

            <Route
              path="/pricing"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Pricing />
                </ProtectedRoute>
              }
            />

            {/* =========================
                MY PAYMENTS
            ========================= */}

            <Route
              path="/my-payments"
              element={
                <ProtectedRoute>
                  <MyPayments />
                </ProtectedRoute>
              }
            />

            {/* =========================
                RECORDED VIDEO LESSONS
            ========================= */}

            <Route
              path="/video-lessons"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <VideoLessons />
                </ProtectedRoute>
              }
            />

            <Route
              path="/video-lessons/:lessonId"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <VideoLesson />
                </ProtectedRoute>
              }
            />

            {/* =========================
                BROWSE INSTRUCTORS
            ========================= */}

            <Route
              path="/instructors"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Instructors />
                </ProtectedRoute>
              }
            />

            <Route
              path="/instructors/:instructorId"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <InstructorDetails />
                </ProtectedRoute>
              }
            />

            {/* =========================
                INSTRUCTOR SETUP
            ========================= */}

            <Route
              path="/instructor-setup"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorSetup />
                </ProtectedRoute>
              }
            />

            {/* =========================
                INSTRUCTOR DASHBOARD
            ========================= */}

            <Route
              path="/instructor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />

            {/* =========================
                MY BOOKINGS / LESSONS
            ========================= */}

            <Route
              path="/my-lessons"
              element={
                <ProtectedRoute>
                  <MyLessons />
                </ProtectedRoute>
              }
            />

            {/* =========================
                LIVE VIDEO CLASSROOM
            ========================= */}

            <Route
              path="/classroom/:bookingId"
              element={
                <ProtectedRoute>
                  <Classroom />
                </ProtectedRoute>
              }
            />

            {/* =========================
                UNKNOWN ROUTES
            ========================= */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

export default App;
