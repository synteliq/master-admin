import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminLayout, TenantLayout } from './layouts/AppLayouts';
import { LoginSelector, AdminLogin, TenantLogin } from './pages/public/LoginPages';
import { AdminDashboard, TenantDashboard } from './pages/Dashboards';
import { TenantList } from './pages/admin/TenantList';
import { FileManagement } from './pages/tenant/FileManagement';
import { TeamManagement } from './pages/tenant/TeamManagement';
import { TenantSettings } from './pages/tenant/TenantSettings';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole: 'admin' | 'tenant' }> = ({ children, requiredRole }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (role !== requiredRole) {
    // Redirect mixed roles
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/tenant/dashboard'} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginSelector />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/tenant/login" element={<TenantLogin />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tenants" element={<TenantList />} />
        <Route path="analytics" element={<div className="p-4">Admin Analytics Here</div>} />
      </Route>

      {/* Tenant Routes */}
      <Route path="/tenant" element={
        <ProtectedRoute requiredRole="tenant">
          <TenantLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="files" element={<FileManagement />} />
        <Route path="teams" element={<TeamManagement />} />
        <Route path="settings" element={<TenantSettings />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
