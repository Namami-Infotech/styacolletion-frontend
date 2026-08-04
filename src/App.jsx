import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';

// Lazy-loaded Page Components for Route-Level Code Splitting
const HomePage = lazy(() => import('./pages/dashboard/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

const EmployeePage = lazy(() => import('./pages/employee/EmployeePage'));
const MyTeamPage = lazy(() => import('./pages/employee/myTeam'));
const CreateEmployeePage = lazy(() => import('./pages/employee/CreateEmployeePage'));
const EmployeeFieldVisitPage = lazy(() => import('./pages/employee/EmployeeFieldVisitPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const TaskPage = lazy(() => import('./pages/tasks/TaskPage'));
const TaskDetails = lazy(() => import('./pages/tasks/TaskDetails'));
const CustomerPage = lazy(() => import('./pages/customers/customerPage'));
const CustomerDetailsPage = lazy(() => import('./pages/customers/customerDetailsPage'));
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'));
const ContactsPage = lazy(() => import('./pages/contacts/contactsPage'));
const OfficePage = lazy(() => import('./pages/office/OfficePage'));
const RolesPage = lazy(() => import('./pages/roles/RolesPage'));
const StatePage = lazy(() => import('./pages/location/state.Page'));
const RegionPage = lazy(() => import('./pages/location/region.Page'));
const BranchPage = lazy(() => import('./pages/location/branch.Page'));
const TaskTypePage = lazy(() => import('./pages/tasks/taskTypePage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

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

// Sleek fallback component displayed while loading lazy routes
function PageLoader() {
  const { isDark } = useThemeMode();
  return (
    <div
      className={`flex items-center justify-center min-h-screen ${
        isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <CircularProgress size={38} thickness={4} color="primary" />
        <span className="text-xs font-semibold tracking-wider uppercase opacity-75">Loading...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastWrapper />
      <AuthProvider>
        <Router>
          <RoutePermissionListener />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

