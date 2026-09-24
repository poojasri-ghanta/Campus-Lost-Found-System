import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleBasedRoute } from './routes/RoleBasedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LostItemsPage } from './pages/LostItemsPage';
import { ReportLostItemPage } from './pages/ReportLostItemPage';
import { LostItemDetailPage } from './pages/LostItemDetailPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { ReportFoundItemPage } from './pages/ReportFoundItemPage';
import { FoundItemDetailPage } from './pages/FoundItemDetailPage';
import { MatchesPage } from './pages/MatchesPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';
import { HandoversPage } from './pages/HandoversPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Main Application Layout */}
              <Route element={<MainLayout />}>
                {/* Public Landing & Item Galleries */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/lost-items" element={<LostItemsPage />} />
                <Route path="/lost-items/:id" element={<LostItemDetailPage />} />
                <Route path="/found-items" element={<FoundItemsPage />} />
                <Route path="/found-items/:id" element={<FoundItemDetailPage />} />

                {/* Protected Student & Finder Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lost-items/report"
                  element={
                    <ProtectedRoute>
                      <ReportLostItemPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/found-items/report"
                  element={
                    <ProtectedRoute>
                      <ReportFoundItemPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <MatchesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches/:id"
                  element={
                    <ProtectedRoute>
                      <MatchesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <ClaimsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims/:id"
                  element={
                    <ProtectedRoute>
                      <ClaimDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/handovers"
                  element={
                    <ProtectedRoute>
                      <HandoversPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes (Role: ADMIN only) */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/disputes"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminDisputesPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminUsersPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditLogsPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminAnalyticsPage />
                    </RoleBasedRoute>
                  }
                />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
