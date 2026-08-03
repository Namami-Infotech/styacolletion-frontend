import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import EmployeePage from './pages/employee/EmployeePage';
import MyTeamPage from './pages/employee/myTeam';
import CreateEmployeePage from './pages/employee/CreateEmployeePage';
import EmployeeFieldVisitPage from './pages/employee/EmployeeFieldVisitPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TaskPage from './pages/tasks/TaskPage';
import TaskDetails from './pages/tasks/TaskDetails';
import CustomerPage from './pages/customers/customerPage';
import CustomerDetailsPage from './pages/customers/customerDetailsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import ContactsPage from './pages/contacts/contactsPage';
import OfficePage from './pages/office/OfficePage';
import RolesPage from './pages/roles/RolesPage';
import StatePage from './pages/location/state.Page';
import RegionPage from './pages/location/region.Page';
import BranchPage from './pages/location/branch.Page';
import TaskTypePage from './pages/tasks/taskTypePage';
import AdminPage from './pages/admin/AdminPage';

// Listener to fetch permissions on every route/page change
function RoutePermissionListener() {
  const location = useLocation();
  const { isAuthenticated, fetchPermissions } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPermissions();
    }
  }, [location.pathname, isAuthenticated, fetchPermissions]);

  return null;
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Only Route Wrapper
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function ToastWrapper() {
  const { isDark } = useThemeMode();
  return <ToastContainer position="top-right" autoClose={3000} theme={isDark ? 'dark' : 'light'} />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastWrapper />
      <AuthProvider>
        <Router>
          <RoutePermissionListener />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/my-team"
              element={
                <ProtectedRoute>
                  <MyTeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-employee"
              element={
                <ProtectedRoute>
                  <CreateEmployeePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/field-visit"
              element={
                <ProtectedRoute>
                  <EmployeeFieldVisitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/details/:slug"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/details"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/*"
              element={
                <ProtectedRoute>
                  <TaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/details/:customerId"
              element={
                <ProtectedRoute>
                  <CustomerDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/details"
              element={
                <ProtectedRoute>
                  <CustomerDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/*"
              element={
                <ProtectedRoute>
                  <CustomerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/*"
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/*"
              element={
                <ProtectedRoute>
                  <ContactsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/office/*"
              element={
                <ProtectedRoute>
                  <OfficePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/*"
              element={
                <ProtectedRoute>
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/states/*"
              element={
                <ProtectedRoute>
                  <StatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/regions/*"
              element={
                <ProtectedRoute>
                  <RegionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branches/*"
              element={
                <ProtectedRoute>
                  <BranchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task-types/*"
              element={
                <ProtectedRoute>
                  <TaskTypePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
